package com.umdb.service;

import com.umdb.dto.SearchRequestDto;
import com.umdb.dto.SearchResultDto;
import com.umdb.dto.SearchSuggestionDto;
import com.umdb.dto.TitleCardDto;
import com.umdb.model.TitleType;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Types;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class SearchService {
    private final NamedParameterJdbcTemplate jdbc;
    private static final int MAX_SEARCH_RESULTS = 1000;
    private static final int MAX_SUGGESTION_CANDIDATES = 500;
    private static final int MAX_SUGGESTIONS = 6;

    public List<SearchSuggestionDto> suggest(String query) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }
        // Filter query matches first before sorting to force use of the GIN index
        String sql = """
            with qq as (
                select to_tsquery('simple', array_to_string(
                    array(select term || ':*' from unnest(tsvector_to_array(to_tsvector('simple', :query))) as term),
                    ' & '
                )) as query
            ),
            matches as (
                select t.id, t.type, t.title, t.release_date, t.poster_url, t.popularity
                from titles t, qq
                where t.title_vector @@ qq.query
                  and t.release_date <= current_date
                limit %d
            )
            select id, type, title, release_date, poster_url
            from matches
            order by popularity desc nulls last, id
            limit %d
            """.formatted(MAX_SUGGESTION_CANDIDATES, MAX_SUGGESTIONS);
        return jdbc.query(sql, new MapSqlParameterSource("query", query.trim()),
            (rs, i) -> SearchSuggestionDto.builder()
                .id(rs.getLong("id"))
                .type(TitleType.valueOf(rs.getString("type")))
                .title(rs.getString("title"))
                .releaseDate(rs.getObject("release_date", LocalDate.class))
                .posterUrl(rs.getString("poster_url"))
                .build());
    }

    public SearchResultDto search(SearchRequestDto req) {
        String query = Objects.requireNonNullElse(req.getQuery(), "").trim();
        MapSqlParameterSource p = params(req, query);

        String cte = """
            with qq as (
                select to_tsquery('simple', array_to_string(
                    array(select term || ':*' from unnest(tsvector_to_array(to_tsvector('simple', :q))) as term),
                    ' & '
                )) as query
            )
            """;
        String where = """
            where (:q = '' or t.title_vector @@ qq.query)
              and t.release_date <= current_date
              and (:type is null or t.type = :type)
              and (:yearFrom is null or t.release_date >= make_date(:yearFrom, 1, 1))
              and (:yearTo is null or t.release_date <= make_date(:yearTo, 12, 31))
              and (:minRating is null or t.rating >= :minRating)
              and (:maxRating is null or t.rating <= :maxRating)
              and (:genreId is null or exists (
                   select 1 from title_genres tg where tg.title_id = t.id and tg.genre_id = :genreId))
            """;

        String orderBy = switch (req.getSort()) {
            case NEWEST -> "order by t.release_date desc nulls last, t.id";
            case RATING -> "order by t.rating_weighted desc nulls last, t.id";
            case null, default -> "order by t.popularity desc nulls last, t.id";
        };

        String sql = cte + """
            select t.id, t.type, t.title, t.overview, t.release_date,
                   t.rating, t.rating_count, t.popularity, t.poster_url, t.backdrop_url
            from titles t, qq
            """ + where + orderBy + """

            limit :limit offset :offset
            """;

        String countSql = cte + """
            select count(*) from (
                select 1 from titles t, qq
            """ + where + """
                limit 1001
            ) x
            """;

        List<TitleCardDto> items = jdbc.query(sql, p, (rs, i) -> TitleCardDto.builder()
            .id(rs.getLong("id"))
            .type(TitleType.valueOf(rs.getString("type")))
            .title(rs.getString("title"))
            .overview(rs.getString("overview"))
            .releaseDate(rs.getObject("release_date", LocalDate.class))
            .rating(rs.getObject("rating", Double.class))
            .ratingCount(rs.getObject("rating_count", Integer.class))
            .popularity(rs.getObject("popularity", Double.class))
            .posterUrl(rs.getString("poster_url"))
            .backdropUrl(rs.getString("backdrop_url"))
            .build());

        Long cnt = jdbc.queryForObject(countSql, p, Long.class);
        int total = cnt == null ? 0 : Math.min(cnt.intValue(), MAX_SEARCH_RESULTS);

        return SearchResultDto.builder()
            .items(items)
            .total(total)
            .totalCapped(cnt != null && cnt > MAX_SEARCH_RESULTS)
            .build();
    }

    private MapSqlParameterSource params(SearchRequestDto req, String query) {
        return new MapSqlParameterSource()
            .addValue("q", query, Types.VARCHAR)
            .addValue("type", req.getType() != null ? req.getType().name() : null, Types.VARCHAR)
            .addValue("yearFrom", req.getYearFrom(), Types.INTEGER)
            .addValue("yearTo", req.getYearTo(), Types.INTEGER)
            .addValue("minRating", req.getMinRating(), Types.DOUBLE)
            .addValue("maxRating", req.getMaxRating(), Types.DOUBLE)
            .addValue("genreId", req.getGenreIds() == null || req.getGenreIds().isEmpty()
                ? null : req.getGenreIds().get(0), Types.BIGINT)
            .addValue("limit", req.getLimit() != null ? req.getLimit() : 24, Types.INTEGER)
            .addValue("offset", req.getOffset() != null ? req.getOffset() : 0, Types.INTEGER);
    }
}

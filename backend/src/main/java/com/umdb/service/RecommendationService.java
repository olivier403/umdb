package com.umdb.service;

import com.umdb.dto.TitleCardDto;
import com.umdb.exception.NotFoundException;
import com.umdb.model.Title;
import com.umdb.model.TitleType;
import com.umdb.repository.TitleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Types;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final TitleRepository titleRepository;
    private final NamedParameterJdbcTemplate jdbcTemplate;

    public List<TitleCardDto> getSimilar(Long id, int limit) {
        Title title = titleRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Title not found"));

        return findSimilarHybrid(id, title.getType(), limit);
    }

    private List<TitleCardDto> findSimilarHybrid(Long id, TitleType type, int limit) {
        // Retrieve ANN candidates by embedding using hnsw index, then filter and rerank.
        // The score is a hybrid of embedding similarity, genre jaccard similarity, and popularity.
        String sql = """
            with source_genres as (
                select genre_id from title_genres where title_id = :id
            ),
            ann_candidates as (
                select t.id,
                       1 - (t.embedding <=> (select embedding from titles where id = :id)) as embed_sim,
                       (select max(popularity) from titles) as max_pop
                from titles t
                order by t.embedding <=> (select embedding from titles where id = :id)
                limit 1000
            ),
            candidates as (
                select a.id,
                       a.embed_sim,
                       a.max_pop
                from ann_candidates a
                join titles t on t.id = a.id
                where t.id != :id
                  and t.type = :type
                  and t.poster_url is not null
                limit 500
            ),
            genre_stats as (
                select c.id,
                       c.embed_sim,
                       c.max_pop,
                       count(tg.genre_id) as candidate_genres,
                       count(tg.genre_id) filter (where tg.genre_id in (select genre_id from source_genres)) as shared_genres
                from candidates c
                left join title_genres tg on tg.title_id = c.id
                group by c.id, c.embed_sim, c.max_pop
            ),
            scores as (
                select gs.id,
                       gs.embed_sim,
                       gs.shared_genres::float / nullif(
                           (select count(*) from source_genres) + gs.candidate_genres - gs.shared_genres,
                           0
                       ) as jaccard_sim,
                       t.popularity,
                       gs.max_pop
                from genre_stats gs
                join titles t on t.id = gs.id
            )
            select t.id, t.type, t.title, t.overview, t.release_date,
                   t.rating, t.rating_count, t.popularity, t.poster_url, t.backdrop_url
            from scores s
            join titles t on t.id = s.id
            order by
                0.55 * s.embed_sim +
                0.2 * coalesce(s.jaccard_sim, 0) +
                0.25 * coalesce(
                    sqrt(greatest(coalesce(s.popularity, 0), 0) / nullif(s.max_pop, 0)),
                    0
                )
                desc
            limit :limit
            """;

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("id", id, Types.BIGINT);
        params.addValue("type", type.name(), Types.VARCHAR);
        params.addValue("limit", limit, Types.INTEGER);

        return jdbcTemplate.query(sql, params, (rs, rowNum) -> {
            String typeStr = rs.getString("type");
            return TitleCardDto.builder()
                .id(rs.getLong("id"))
                .type(typeStr != null ? TitleType.valueOf(typeStr) : null)
                .title(rs.getString("title"))
                .overview(rs.getString("overview"))
                .releaseDate(rs.getObject("release_date", LocalDate.class))
                .rating(rs.getObject("rating", Double.class))
                .ratingCount(rs.getObject("rating_count", Integer.class))
                .popularity(rs.getObject("popularity", Double.class))
                .posterUrl(rs.getString("poster_url"))
                .backdropUrl(rs.getString("backdrop_url"))
                .build();
        });
    }
}

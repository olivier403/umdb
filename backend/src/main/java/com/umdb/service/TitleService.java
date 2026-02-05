package com.umdb.service;

import com.umdb.dto.TitleCardDto;
import com.umdb.dto.TitleDetailDto;
import com.umdb.exception.NotFoundException;
import com.umdb.model.Title;
import com.umdb.model.TitleType;
import com.umdb.repository.TitleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TitleService {
    private final TitleRepository titleRepository;
    private final TitleMapper mapper;
    private final ReviewService reviewService;
    private final JdbcTemplate jdbcTemplate;

    public List<TitleCardDto> getTrending(int limit) {
        return titleRepository.findTrending(null, PageRequest.of(0, limit))
            .stream().map(mapper::toCard).toList();
    }

    public List<TitleCardDto> getNewReleases(int limit) {
        return titleRepository.findNewReleases(PageRequest.of(0, limit))
            .stream().map(mapper::toCard).toList();
    }

    public List<TitleCardDto> getTopRated(int limit) {
        return titleRepository.findTopRated(null, PageRequest.of(0, limit))
            .stream().map(mapper::toCard).toList();
    }

    public TitleCounts getCounts() {
        return new TitleCounts(
            titleRepository.countByType(TitleType.MOVIE),
            titleRepository.countByType(TitleType.TV)
        );
    }

    public record TitleCounts(long movies, long tv) {}

    public long getEstimatedTotalCount() {
        String sql = """
            select coalesce(
                (select n_live_tup
                 from pg_stat_user_tables
                 where relname = 'titles'
                   and schemaname = current_schema()),
                (select reltuples
                 from pg_class c
                 join pg_namespace n on n.oid = c.relnamespace
                 where c.relname = 'titles'
                   and n.nspname = current_schema())
            )
            """;
        Number estimate = jdbcTemplate.queryForObject(sql, Number.class);
        if (estimate == null) {
            return 0L;
        }
        long rounded = Math.round(estimate.doubleValue());
        return Math.max(0L, rounded);
    }

    public TitleDetailDto getDetail(Long id) {
        Title title = titleRepository.findDetailById(id)
            .orElseThrow(() -> new NotFoundException("Title not found"));
        return mapper.toDetail(title, reviewService.getRecentReviews(id, 2));
    }
}

package com.umdb.repository;

import com.umdb.model.Title;
import com.umdb.model.TitleType;
import java.util.List;
import java.util.Optional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

public interface TitleRepository extends JpaRepository<Title, Long> {

    @Cacheable("titleCounts")
    long countByType(TitleType type);

    @Query("select t from Title t where (:type is null or t.type = :type) order by t.popularity desc nulls last, t.id")
    List<Title> findTrending(@Param("type") TitleType type, Pageable pageable);

    @Query("select t from Title t where t.releaseDate <= current_date order by t.releaseDate desc nulls last, t.id")
    List<Title> findNewReleases(Pageable pageable);

    @Query("select t from Title t where (:type is null or t.type = :type) order by t.ratingWeighted desc nulls last, t.id")
    List<Title> findTopRated(@Param("type") TitleType type, Pageable pageable);

    @Query("""
            select distinct t
            from Title t
            left join fetch t.genres
            left join fetch t.cast c
            left join fetch c.person
            where t.id = :id
            """)
    Optional<Title> findDetailById(@Param("id") Long id);
}

package com.umdb.repository;

import com.umdb.model.Review;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByTitleIdAndUserId(Long titleId, Long userId);

    @Query("""
            select r
            from Review r
            join fetch r.user
            where r.title.id = :titleId
            order by r.updatedAt desc
            """)
    List<Review> findRecentByTitleId(@Param("titleId") Long titleId, Pageable pageable);
}

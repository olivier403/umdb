package com.umdb.service;

import com.umdb.dto.ReviewDto;
import com.umdb.dto.ReviewRequestDto;
import com.umdb.exception.NotFoundException;
import com.umdb.model.Review;
import com.umdb.model.Title;
import com.umdb.model.User;
import com.umdb.repository.ReviewRepository;
import com.umdb.repository.TitleRepository;
import com.umdb.security.AuthUtils;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final TitleRepository titleRepository;

    @Value("${app.reviews.enabled:true}")
    private boolean reviewsEnabled;

    public List<ReviewDto> getRecentReviews(Long titleId, int limit) {
        if (limit <= 0) {
            return List.of();
        }
        return reviewRepository.findRecentByTitleId(titleId, PageRequest.of(0, limit))
            .stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ReviewDto upsertReview(Long titleId, ReviewRequestDto request,
                                  Authentication authentication) {
        if (!reviewsEnabled) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Reviews are currently disabled");
        }
        User user = AuthUtils.requireUser(authentication);
        Title title = titleRepository.findById(titleId)
            .orElseThrow(() -> new NotFoundException("Title not found"));

        Review review = reviewRepository.findByTitleIdAndUserId(titleId, user.getId())
            .orElseGet(() -> Review.builder()
                .title(title)
                .user(user)
                .build());

        // Normally some batch job would update the movie ratings periodically based on reviews,
        // or each title could keep a running total & count.
        // But not worth it for this small demo where one rating wouldn't budge the average.
        review.setRating(request.getRating());
        review.setReview(request.getReview().trim());

        Review saved = reviewRepository.save(review);
        return toDto(saved);
    }

    private ReviewDto toDto(Review review) {
        User author = review.getUser();
        return ReviewDto.builder()
            .id(review.getId())
            .rating(review.getRating())
            .review(review.getReview())
            .createdAt(review.getCreatedAt())
            .updatedAt(review.getUpdatedAt())
            .userId(author != null ? author.getId() : null)
            .userName(author != null ? author.getName() : null)
            .build();
    }

}

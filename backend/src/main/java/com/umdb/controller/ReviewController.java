package com.umdb.controller;

import com.umdb.dto.ReviewDto;
import com.umdb.dto.ReviewRequestDto;
import com.umdb.service.ReviewService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/titles/{titleId}/reviews")
@RequiredArgsConstructor
@Validated
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping
    public List<ReviewDto> recentReviews(
        @PathVariable Long titleId,
        @RequestParam(name = "limit", defaultValue = "2") @Min(1) @Max(50) int limit
    ) {
        return reviewService.getRecentReviews(titleId, limit);
    }

    @PostMapping
    public ReviewDto addReview(
        @PathVariable Long titleId,
        @Valid @RequestBody ReviewRequestDto request,
        Authentication authentication
    ) {
        return reviewService.upsertReview(titleId, request, authentication);
    }
}

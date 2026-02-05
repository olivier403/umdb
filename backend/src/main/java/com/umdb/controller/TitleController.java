package com.umdb.controller;

import com.umdb.dto.TitleCardDto;
import com.umdb.dto.TitleDetailDto;
import com.umdb.service.RecommendationService;
import com.umdb.service.TitleService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/titles")
@RequiredArgsConstructor
@Validated
public class TitleController {
    private final TitleService titleService;
    private final RecommendationService recommendationService;

    @GetMapping("/{id}")
    public TitleDetailDto detail(@PathVariable Long id) {
        return titleService.getDetail(id);
    }

    @GetMapping("/{id}/similar")
    public List<TitleCardDto> similar(
        @PathVariable Long id,
        @RequestParam(name = "limit", defaultValue = "12") @Min(1) @Max(50) int limit
    ) {
        return recommendationService.getSimilar(id, limit);
    }
}

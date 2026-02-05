package com.umdb.controller;

import com.umdb.dto.HomeResponseDto;
import com.umdb.dto.HomeSectionDto;
import com.umdb.service.TitleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {
    private final TitleService titleService;

    @GetMapping
    public HomeResponseDto home() {
        return HomeResponseDto.builder()
            .sections(List.of(
                HomeSectionDto.builder().title("Trending Now").items(titleService.getTrending(12)).build(),
                HomeSectionDto.builder().title("New Releases").items(titleService.getNewReleases(12)).build(),
                HomeSectionDto.builder().title("Top Rated").items(titleService.getTopRated(12)).build()
            ))
            .totalCountEstimate(titleService.getEstimatedTotalCount())
            .build();
    }
}

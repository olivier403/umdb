package com.umdb.controller;

import com.umdb.dto.SearchRequestDto;
import com.umdb.dto.SearchResultDto;
import com.umdb.dto.SearchSuggestionDto;
import com.umdb.service.SearchService;
import jakarta.validation.Valid;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
    private final SearchService searchService;

    @GetMapping("/suggest")
    public List<SearchSuggestionDto> suggest(@RequestParam("q") String query) {
        return searchService.suggest(query);
    }

    @PostMapping
    public SearchResultDto search(@Valid @RequestBody SearchRequestDto request) {
        return searchService.search(request);
    }
}

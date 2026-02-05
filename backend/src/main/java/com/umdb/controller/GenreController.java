package com.umdb.controller;

import com.umdb.dto.GenreDto;
import com.umdb.repository.GenreRepository;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {
    private final GenreRepository genreRepository;

    @GetMapping
    public List<GenreDto> list() {
        return genreRepository.findAll().stream()
            .sorted(Comparator.comparing(g -> g.getName().toLowerCase()))
            .map(genre -> GenreDto.builder()
                .id(genre.getId())
                .name(genre.getName())
                .build())
            .collect(Collectors.toList());
    }
}

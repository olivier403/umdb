package com.umdb.service;

import com.umdb.dto.PeopleResponseDto;
import com.umdb.dto.PersonCardDto;
import com.umdb.repository.PersonRepository;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PersonService {
    private final PersonRepository personRepository;

    public PeopleResponseDto listPeople(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.clamp(size, 1, 60);
        var pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "name"));
        var result = personRepository.findAll(pageable);
        List<PersonCardDto> items = result.getContent().stream()
            .map(person -> PersonCardDto.builder()
                .id(person.getId())
                .name(person.getName())
                .profileUrl(person.getProfileUrl())
                .build())
            .toList();
        return PeopleResponseDto.builder()
            .items(items)
            .total(result.getTotalElements())
            .page(safePage)
            .size(safeSize)
            .totalPages(result.getTotalPages())
            .build();
    }
}

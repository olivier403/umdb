package com.umdb.controller;

import com.umdb.dto.PeopleResponseDto;
import com.umdb.service.PersonService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/people")
@RequiredArgsConstructor
@Validated
public class PersonController {
    private final PersonService personService;

    @GetMapping
    public PeopleResponseDto list(
        @RequestParam(defaultValue = "0") @Min(0) int page,
        @RequestParam(defaultValue = "24") @Min(1) @Max(100) int size
    ) {
        return personService.listPeople(page, size);
    }
}

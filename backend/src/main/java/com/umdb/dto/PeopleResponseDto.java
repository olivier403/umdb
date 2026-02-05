package com.umdb.dto;

import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PeopleResponseDto {
    List<PersonCardDto> items;
    long total;
    int page;
    int size;
    int totalPages;
}

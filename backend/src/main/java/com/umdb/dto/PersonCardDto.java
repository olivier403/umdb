package com.umdb.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PersonCardDto {
    Long id;
    String name;
    String profileUrl;
}

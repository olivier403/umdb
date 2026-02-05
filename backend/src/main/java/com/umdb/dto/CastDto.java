package com.umdb.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CastDto {
    Long id;
    String name;
    String profileUrl;
    String characterName;
}

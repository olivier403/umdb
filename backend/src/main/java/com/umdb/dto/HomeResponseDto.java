package com.umdb.dto;

import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class HomeResponseDto {
    List<HomeSectionDto> sections;
    long totalCountEstimate;
}

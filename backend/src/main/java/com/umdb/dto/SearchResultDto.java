package com.umdb.dto;

import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SearchResultDto {
    List<TitleCardDto> items;
    Integer total;
    boolean totalCapped;
}

package com.umdb.dto;

import com.umdb.model.TitleType;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SearchSuggestionDto {
    Long id;
    TitleType type;
    String title;
    LocalDate releaseDate;
    String posterUrl;
}

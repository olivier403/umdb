package com.umdb.dto;

import com.umdb.model.TitleType;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TitleCardDto {
    Long id;
    TitleType type;
    String title;
    String overview;
    LocalDate releaseDate;
    Double rating;
    Integer ratingCount;
    Double popularity;
    String posterUrl;
    String backdropUrl;
}

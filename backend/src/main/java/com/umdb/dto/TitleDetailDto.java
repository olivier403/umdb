package com.umdb.dto;

import com.umdb.model.TitleType;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TitleDetailDto {
    Long id;
    TitleType type;
    String title;
    String overview;
    LocalDate releaseDate;
    Integer runtimeMinutes;
    Integer seasonCount;
    Double rating;
    Integer ratingCount;
    Double popularity;
    String posterUrl;
    String backdropUrl;
    List<GenreDto> genres;
    List<CastDto> cast;
    List<ReviewDto> recentReviews;
}

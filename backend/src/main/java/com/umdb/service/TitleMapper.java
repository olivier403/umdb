package com.umdb.service;

import com.umdb.dto.CastDto;
import com.umdb.dto.GenreDto;
import com.umdb.dto.ReviewDto;
import com.umdb.dto.TitleCardDto;
import com.umdb.dto.TitleDetailDto;
import com.umdb.model.CastMember;
import com.umdb.model.Genre;
import com.umdb.model.Title;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
public class TitleMapper {

    public TitleCardDto toCard(Title title) {
        return TitleCardDto.builder()
            .id(title.getId())
            .type(title.getType())
            .title(title.getTitle())
            .overview(title.getOverview())
            .releaseDate(title.getReleaseDate())
            .rating(title.getRating())
            .ratingCount(title.getRatingCount())
            .popularity(title.getPopularity())
            .posterUrl(title.getPosterUrl())
            .backdropUrl(title.getBackdropUrl())
            .build();
    }

    public TitleDetailDto toDetail(Title title) {
        return toDetail(title, List.of());
    }

    public TitleDetailDto toDetail(Title title, List<ReviewDto> recentReviews) {
        List<GenreDto> genres = title.getGenres().stream()
            .sorted(Comparator.comparing(Genre::getName))
            .map(genre -> GenreDto.builder()
                .id(genre.getId())
                .name(genre.getName())
                .build())
            .collect(Collectors.toList());

        List<CastDto> cast = title.getCast().stream()
            .sorted(Comparator.comparing(CastMember::getBillingOrder,
                Comparator.nullsLast(Integer::compareTo)))
            .map(member -> CastDto.builder()
                .id(member.getPerson().getId())
                .name(member.getPerson().getName())
                .profileUrl(member.getPerson().getProfileUrl())
                .characterName(member.getCharacterName())
                .build())
            .collect(Collectors.toList());

        return TitleDetailDto.builder()
            .id(title.getId())
            .type(title.getType())
            .title(title.getTitle())
            .overview(title.getOverview())
            .releaseDate(title.getReleaseDate())
            .runtimeMinutes(title.getRuntimeMinutes())
            .seasonCount(title.getSeasonCount())
            .rating(title.getRating())
            .ratingCount(title.getRatingCount())
            .popularity(title.getPopularity())
            .posterUrl(title.getPosterUrl())
            .backdropUrl(title.getBackdropUrl())
            .genres(genres)
            .cast(cast)
            .recentReviews(recentReviews)
            .build();
    }
}

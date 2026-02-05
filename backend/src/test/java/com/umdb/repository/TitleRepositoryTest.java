package com.umdb.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.umdb.model.Title;
import com.umdb.model.TitleType;
import com.umdb.support.PostgresTestContainerConfig;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TitleRepositoryTest extends PostgresTestContainerConfig {

    @Autowired
    private TitleRepository titleRepository;

    @BeforeEach
    void setUp() {
        titleRepository.deleteAll();
    }

    @Test
    void findTrendingOrdersByPopularityAndFiltersByType() {
        Title movieHigh = Title.builder()
            .title("Popular Movie")
            .type(TitleType.MOVIE)
            .popularity(95.2)
            .rating(7.1)
            .ratingCount(1000)
            .releaseDate(LocalDate.of(2024, 1, 10))
            .build();

        Title movieLow = Title.builder()
            .title("Less Popular Movie")
            .type(TitleType.MOVIE)
            .popularity(45.4)
            .rating(6.2)
            .ratingCount(500)
            .releaseDate(LocalDate.of(2023, 8, 5))
            .build();

        Title tvHigher = Title.builder()
            .title("Popular Series")
            .type(TitleType.TV)
            .popularity(88.8)
            .rating(8.3)
            .ratingCount(800)
            .releaseDate(LocalDate.of(2025, 2, 1))
            .build();

        titleRepository.saveAll(List.of(movieHigh, movieLow, tvHigher));

        List<Title> allTrending = titleRepository.findTrending(
            null,
            PageRequest.of(0, 3, Sort.unsorted())
        );

        assertThat(allTrending)
            .extracting(Title::getTitle)
            .containsExactly("Popular Movie", "Popular Series", "Less Popular Movie");

        List<Title> movieTrending = titleRepository.findTrending(
            TitleType.MOVIE,
            PageRequest.of(0, 5, Sort.unsorted())
        );

        assertThat(movieTrending)
            .extracting(Title::getTitle)
            .containsExactly("Popular Movie", "Less Popular Movie");
    }

    @Test
    void findNewReleasesFiltersFutureTitlesAndOrdersByReleaseDateDesc() {
        Title oldRelease = Title.builder()
            .title("Old Release")
            .type(TitleType.MOVIE)
            .releaseDate(LocalDate.of(2024, 1, 1))
            .popularity(10.0)
            .rating(5.4)
            .ratingCount(200)
            .build();

        Title recentRelease = Title.builder()
            .title("Recent Release")
            .type(TitleType.MOVIE)
            .releaseDate(LocalDate.of(2026, 1, 15))
            .popularity(15.0)
            .rating(6.4)
            .ratingCount(150)
            .build();

        Title futureRelease = Title.builder()
            .title("Future Release")
            .type(TitleType.MOVIE)
            .releaseDate(LocalDate.of(2027, 5, 1))
            .popularity(99.9)
            .rating(9.9)
            .ratingCount(50)
            .build();

        titleRepository.saveAll(List.of(oldRelease, recentRelease, futureRelease));

        List<Title> newReleases = titleRepository.findNewReleases(
            PageRequest.of(0, 10, Sort.unsorted())
        );

        // Future releases should be excluded, rest ordered by release_date desc
        assertThat(newReleases)
            .extracting(Title::getTitle)
            .containsExactly("Recent Release", "Old Release");
    }

    @Test
    void findTopRatedOrdersByRatingAndFiltersByType() {
        Title movieTop = Title.builder()
            .title("Top Rated Movie")
            .type(TitleType.MOVIE)
            .rating(9.1)
            .ratingCount(5000)
            .popularity(30.0)
            .releaseDate(LocalDate.of(2022, 6, 1))
            .build();

        Title movieLow = Title.builder()
            .title("Lower Rated Movie")
            .type(TitleType.MOVIE)
            .rating(6.3)
            .ratingCount(3000)
            .popularity(40.0)
            .releaseDate(LocalDate.of(2021, 3, 15))
            .build();

        Title tvTop = Title.builder()
            .title("Top Rated Series")
            .type(TitleType.TV)
            .rating(8.7)
            .ratingCount(4000)
            .popularity(55.0)
            .releaseDate(LocalDate.of(2024, 9, 10))
            .build();

        titleRepository.saveAll(List.of(movieTop, movieLow, tvTop));

        List<Title> allTopRated = titleRepository.findTopRated(
            null,
            PageRequest.of(0, 5, Sort.unsorted())
        );

        assertThat(allTopRated)
            .extracting(Title::getTitle)
            .containsExactly("Top Rated Movie", "Top Rated Series", "Lower Rated Movie");

        List<Title> movieTopRated = titleRepository.findTopRated(
            TitleType.MOVIE,
            PageRequest.of(0, 5, Sort.unsorted())
        );

        assertThat(movieTopRated)
            .extracting(Title::getTitle)
            .containsExactly("Top Rated Movie", "Lower Rated Movie");
    }
}

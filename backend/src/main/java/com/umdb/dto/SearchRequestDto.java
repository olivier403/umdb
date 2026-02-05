package com.umdb.dto;

import com.umdb.model.TitleType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import lombok.Data;

@Data
public class SearchRequestDto {
    private String query;
    private TitleType type;
    private Integer yearFrom;
    private Integer yearTo;
    private List<Long> genreIds;
    @Min(0)
    private Double minRating;
    @Max(10)
    private Double maxRating;
    private SearchSort sort;
    @Min(1)
    @Max(100)
    private Integer limit = 20;
    @Min(0)
    @Max(5000)
    private Integer offset = 0;
}

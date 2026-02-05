package com.umdb.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ReviewDto {
    Long id;
    Integer rating;
    String review;
    Instant createdAt;
    Instant updatedAt;
    Long userId;
    String userName;
}

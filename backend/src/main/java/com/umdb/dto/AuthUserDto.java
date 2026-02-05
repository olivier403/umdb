package com.umdb.dto;

import com.umdb.model.User;

import java.time.Instant;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthUserDto {
    Long id;
    String name;
    String email;
    Instant createdAt;

    public static AuthUserDto from(User user) {
        return AuthUserDto.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .createdAt(user.getCreatedAt())
            .build();
    }
}

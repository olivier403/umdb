package com.umdb.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthResponseDto {
    AuthUserDto user;
}

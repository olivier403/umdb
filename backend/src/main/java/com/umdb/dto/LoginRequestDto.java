package com.umdb.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Value;

@Value
public class LoginRequestDto {
    @NotBlank
    @Email
    String email;

    @NotBlank
    String password;
}

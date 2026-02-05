package com.umdb.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Value;

@Value
public class SignupRequestDto {
    @NotBlank
    @Size(min = 2, max = 120)
    String name;

    @NotBlank
    @Email
    String email;

    @NotBlank
    @Size(min = 8, max = 128)
    String password;
}

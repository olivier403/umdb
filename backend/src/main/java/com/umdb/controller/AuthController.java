package com.umdb.controller;

import com.umdb.dto.AuthResponseDto;
import com.umdb.dto.LoginRequestDto;
import com.umdb.dto.SignupRequestDto;
import com.umdb.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @GetMapping("/me")
    public AuthResponseDto me(Authentication authentication) {
        return AuthResponseDto.builder()
            .user(authService.me(authentication))
            .build();
    }

    @PostMapping("/signup")
    public AuthResponseDto signup(
        @Valid @RequestBody SignupRequestDto request,
        HttpServletRequest httpRequest,
        HttpServletResponse httpResponse
    ) {
        return AuthResponseDto.builder()
            .user(authService.signup(request, httpRequest, httpResponse))
            .build();
    }

    @PostMapping("/login")
    public AuthResponseDto login(
        @Valid @RequestBody LoginRequestDto request,
        HttpServletRequest httpRequest,
        HttpServletResponse httpResponse
    ) {
        return AuthResponseDto.builder()
            .user(authService.login(request, httpRequest, httpResponse))
            .build();
    }

    @PostMapping("/logout")
    public void logout(
        HttpServletRequest httpRequest,
        HttpServletResponse httpResponse,
        Authentication authentication
    ) {
        authService.logout(httpRequest, httpResponse, authentication);
    }
}

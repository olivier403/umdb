package com.umdb.service;

import com.umdb.dto.AuthUserDto;
import com.umdb.dto.LoginRequestDto;
import com.umdb.dto.SignupRequestDto;
import com.umdb.model.User;
import com.umdb.repository.UserRepository;
import com.umdb.security.AuthUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Locale;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    public AuthUserDto signup(SignupRequestDto request, HttpServletRequest httpRequest,
                              HttpServletResponse httpResponse) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        User user = User.builder()
            .name(request.getName().trim())
            .email(email)
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .build();

        userRepository.save(user);
        return authenticate(email, request.getPassword(), httpRequest, httpResponse);
    }

    public AuthUserDto login(LoginRequestDto request, HttpServletRequest httpRequest,
                             HttpServletResponse httpResponse) {
        return authenticate(normalizeEmail(request.getEmail()), request.getPassword(), httpRequest,
            httpResponse);
    }

    public AuthUserDto me(Authentication authentication) {
        return AuthUserDto.from(AuthUtils.requireUser(authentication));
    }

    public void logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse,
                       Authentication authentication) {
        new SecurityContextLogoutHandler().logout(httpRequest, httpResponse, authentication);
    }

    private AuthUserDto authenticate(
        String email,
        String password,
        HttpServletRequest httpRequest,
        HttpServletResponse httpResponse
    ) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        return AuthUserDto.from(AuthUtils.requireUser(authentication));
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return "";
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

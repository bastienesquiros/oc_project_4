package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.security.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.security.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.security.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.dto.MessageResponse;
import com.openclassrooms.starterjwt.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody SignupRequest signUpRequest) {
        authService.register(signUpRequest);
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}

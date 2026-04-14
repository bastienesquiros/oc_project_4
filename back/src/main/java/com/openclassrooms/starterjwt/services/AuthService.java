package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.security.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.security.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.security.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils,
                       PasswordEncoder passwordEncoder,
                       UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
    }

    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.findByEmail(userDetails.getUsername());
        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(),
                userDetails.getFirstName(), userDetails.getLastName(), user.isAdmin());
    }

    public void register(SignupRequest request) {
        if (userService.existsByEmail(request.email())) {
            throw new BadRequestException();
        }
        User user = new User(request.email(), request.lastName(), request.firstName(),
                passwordEncoder.encode(request.password()));
        userService.save(user);
    }
}

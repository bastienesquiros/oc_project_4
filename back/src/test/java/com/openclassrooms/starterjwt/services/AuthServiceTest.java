package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.security.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.security.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User user;
    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@test.com").lastName("Doe").firstName("John").password("encoded").admin(false).build();
        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("user@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("encoded")
                .build();
    }

    @Test
    void login_withValidCredentials_shouldReturnJwtResponse() {
        LoginRequest request = new LoginRequest("user@test.com", "password");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("myjwttoken");
        when(userService.findByEmail("user@test.com")).thenReturn(user);

        JwtResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("myjwttoken");
        assertThat(response.username()).isEqualTo("user@test.com");
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.admin()).isFalse();
    }

    @Test
    void register_withNewEmail_shouldEncodePasswordAndSaveUser() {
        SignupRequest request = new SignupRequest("new@test.com", "Jane", "Smith", "password123");
        when(userService.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPwd");

        authService.register(request);

        verify(passwordEncoder).encode("password123");
        verify(userService).save(any(User.class));
    }

    @Test
    void register_withExistingEmail_shouldThrowBadRequestException() {
        SignupRequest request = new SignupRequest("existing@test.com", "Jane", "Smith", "password123");
        when(userService.existsByEmail("existing@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class);
    }
}

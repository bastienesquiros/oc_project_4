package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtUtilsTest {

    @InjectMocks
    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    /* JJWT 0.12 treats the string secret as base64-encoded bytes, so it must only
       contain valid base64 characters (A-Z, a-z, 0-9, +, /). Using a hex-only
       string (matching the TOKEN_SECRET format from .env) satisfies this constraint
       and yields >= 512 bits when decoded (128 hex chars → 96 decoded bytes = 768 bits). */
    private static final String SECRET =
            "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce" +
            "47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e";
    private static final String WRONG_SECRET =
            "0000000000000000000000000000000000000000000000000000000000000000" +
            "0000000000000000000000000000000000000000000000000000000000000001";
    private static final int EXPIRATION_MS = 86400000;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", EXPIRATION_MS);
    }

    @Test
    void generateJwtToken_shouldReturnNonNullToken() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L).username("user@test.com").firstName("John").lastName("Doe").password("pwd").build();
        when(authentication.getPrincipal()).thenReturn(userDetails);

        String token = jwtUtils.generateJwtToken(authentication);

        assertThat(token).isNotBlank();
    }

    @Test
    void getUserNameFromJwtToken_shouldReturnCorrectUsername() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L).username("user@test.com").firstName("John").lastName("Doe").password("pwd").build();
        when(authentication.getPrincipal()).thenReturn(userDetails);
        String token = jwtUtils.generateJwtToken(authentication);

        String username = jwtUtils.getUserNameFromJwtToken(token);

        assertThat(username).isEqualTo("user@test.com");
    }

    @Test
    void validateJwtToken_withValidToken_shouldReturnTrue() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L).username("user@test.com").firstName("John").lastName("Doe").password("pwd").build();
        when(authentication.getPrincipal()).thenReturn(userDetails);
        String token = jwtUtils.generateJwtToken(authentication);

        assertThat(jwtUtils.validateJwtToken(token)).isTrue();
    }

    @Test
    void validateJwtToken_withMalformedToken_shouldReturnFalse() {
        assertThat(jwtUtils.validateJwtToken("not.a.valid.jwt.token")).isFalse();
    }

    @Test
    void validateJwtToken_withExpiredToken_shouldReturnFalse() {
        String expiredToken = Jwts.builder()
                .setSubject("user@test.com")
                .setIssuedAt(new Date(System.currentTimeMillis() - 2000))
                .setExpiration(new Date(System.currentTimeMillis() - 1000))
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();

        assertThat(jwtUtils.validateJwtToken(expiredToken)).isFalse();
    }

    @Test
    void validateJwtToken_withTokenSignedWithWrongSecret_shouldReturnFalse() {
        String tokenWithWrongSecret = Jwts.builder()
                .setSubject("user@test.com")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(SignatureAlgorithm.HS512, WRONG_SECRET)
                .compact();

        assertThat(jwtUtils.validateJwtToken(tokenWithWrongSecret)).isFalse();
    }

    @Test
    void validateJwtToken_withEmptyToken_shouldReturnFalse() {
        assertThat(jwtUtils.validateJwtToken("")).isFalse();
    }

    @Test
    void validateJwtToken_withUnsupportedToken_shouldReturnFalse() {
        // An unsecured JWT (no signature) is unsupported when a signing key is expected
        String unsupportedToken = Jwts.builder()
                .setSubject("user@test.com")
                .compact();

        assertThat(jwtUtils.validateJwtToken(unsupportedToken)).isFalse();
    }
}

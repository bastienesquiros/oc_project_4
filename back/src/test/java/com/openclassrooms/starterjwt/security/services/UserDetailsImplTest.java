package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.assertj.core.api.Assertions.assertThat;

class UserDetailsImplTest {

    private UserDetailsImpl buildUser(Long id) {
        return UserDetailsImpl.builder()
                .id(id)
                .username("user@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("encodedPassword")
                .admin(false)
                .build();
    }

    @Test
    void equals_withSameInstance_shouldReturnTrue() {
        UserDetailsImpl user = buildUser(1L);

        assertThat(user.equals(user)).isTrue();
    }

    @Test
    void equals_withSameId_shouldReturnTrue() {
        UserDetailsImpl user1 = buildUser(1L);
        UserDetailsImpl user2 = buildUser(1L);

        assertThat(user1.equals(user2)).isTrue();
    }

    @Test
    void equals_withDifferentId_shouldReturnFalse() {
        UserDetailsImpl user1 = buildUser(1L);
        UserDetailsImpl user2 = buildUser(2L);

        assertThat(user1.equals(user2)).isFalse();
    }

    @Test
    void equals_withNull_shouldReturnFalse() {
        UserDetailsImpl user = buildUser(1L);

        assertThat(user.equals(null)).isFalse();
    }

    @Test
    void equals_withDifferentClass_shouldReturnFalse() {
        UserDetailsImpl user = buildUser(1L);

        assertThat(user.equals("not a UserDetailsImpl")).isFalse();
    }

    @Test
    void getAuthorities_shouldReturnEmptySet() {
        UserDetailsImpl user = buildUser(1L);

        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();

        assertThat(authorities).isEmpty();
    }

    @Test
    void accountStatus_allFlagsShouldBeActive() {
        UserDetailsImpl user = buildUser(1L);

        assertThat(user.isAccountNonExpired()).isTrue();
        assertThat(user.isAccountNonLocked()).isTrue();
        assertThat(user.isCredentialsNonExpired()).isTrue();
        assertThat(user.isEnabled()).isTrue();
    }

    @Test
    void getters_shouldReturnCorrectValues() {
        UserDetailsImpl user = UserDetailsImpl.builder()
                .id(42L)
                .username("john@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("secret")
                .admin(true)
                .build();

        assertThat(user.getId()).isEqualTo(42L);
        assertThat(user.getUsername()).isEqualTo("john@test.com");
        assertThat(user.getFirstName()).isEqualTo("John");
        assertThat(user.getLastName()).isEqualTo("Doe");
        assertThat(user.getPassword()).isEqualTo("secret");
        assertThat(user.getAdmin()).isTrue();
    }
}

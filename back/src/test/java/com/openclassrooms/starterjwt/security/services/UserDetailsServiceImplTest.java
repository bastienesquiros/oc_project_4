package com.openclassrooms.starterjwt.security.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void loadUserByUsername_withExistingUser_shouldReturnPopulatedUserDetails() {
        User user = User.builder()
                .id(1L).email("user@test.com").lastName("Doe").firstName("John").password("hashed").build();
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        UserDetails result = userDetailsService.loadUserByUsername("user@test.com");

        assertThat(result.getUsername()).isEqualTo("user@test.com");
        assertThat(result.getPassword()).isEqualTo("hashed");
        UserDetailsImpl impl = (UserDetailsImpl) result;
        assertThat(impl.getId()).isEqualTo(1L);
        assertThat(impl.getFirstName()).isEqualTo("John");
        assertThat(impl.getLastName()).isEqualTo("Doe");
    }

    @Test
    void loadUserByUsername_withNonExistingUser_shouldThrowUsernameNotFoundException() {
        when(userRepository.findByEmail("nobody@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("nobody@test.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("nobody@test.com");
    }
}

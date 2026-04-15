package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@test.com").lastName("Doe").firstName("Jane").password("hashed").build();
    }

    @Test
    void delete_shouldCallRepositoryDeleteById() {
        userService.delete(1L);

        verify(userRepository).deleteById(1L);
    }

    @Test
    void findById_withExistingId_shouldReturnUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.findById(1L);

        assertThat(result).isEqualTo(user);
    }

    @Test
    void findById_withNonExistingId_shouldThrowNotFoundException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(99L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void existsByEmail_withExistingEmail_shouldReturnTrue() {
        when(userRepository.existsByEmail("user@test.com")).thenReturn(true);

        assertThat(userService.existsByEmail("user@test.com")).isTrue();
    }

    @Test
    void existsByEmail_withNonExistingEmail_shouldReturnFalse() {
        when(userRepository.existsByEmail("nobody@test.com")).thenReturn(false);

        assertThat(userService.existsByEmail("nobody@test.com")).isFalse();
    }

    @Test
    void findByEmail_withExistingEmail_shouldReturnUser() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        User result = userService.findByEmail("user@test.com");

        assertThat(result).isEqualTo(user);
    }

    @Test
    void findByEmail_withNonExistingEmail_shouldThrowNotFoundException() {
        when(userRepository.findByEmail("nobody@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findByEmail("nobody@test.com"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void save_shouldDelegateToRepositoryAndReturnUser() {
        when(userRepository.save(user)).thenReturn(user);

        User result = userService.save(user);

        assertThat(result).isEqualTo(user);
        verify(userRepository).save(user);
    }
}

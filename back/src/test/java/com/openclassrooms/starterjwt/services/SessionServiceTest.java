package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    private User user1;
    private Session session;

    @BeforeEach
    void setUp() {
        user1 = User.builder().id(1L).email("user1@test.com").lastName("Doe").firstName("John").password("pwd").build();
        session = Session.builder()
                .id(1L)
                .name("Yoga Morning")
                .date(new Date())
                .description("A morning yoga session")
                .users(new ArrayList<>())
                .build();
    }

    @Test
    void create_shouldSaveAndReturnSession() {
        when(sessionRepository.save(session)).thenReturn(session);

        Session result = sessionService.create(session);

        assertThat(result).isEqualTo(session);
        verify(sessionRepository).save(session);
    }

    @Test
    void delete_withExistingId_shouldDeleteSession() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        sessionService.delete(1L);

        verify(sessionRepository).deleteById(1L);
    }

    @Test
    void delete_withNonExistingId_shouldThrowNotFoundException() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.delete(99L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void findAll_shouldReturnAllSessions() {
        List<Session> sessions = Arrays.asList(session, Session.builder().id(2L).name("Evening").date(new Date()).description("desc").users(new ArrayList<>()).build());
        when(sessionRepository.findAll()).thenReturn(sessions);

        List<Session> result = sessionService.findAll();

        assertThat(result).hasSize(2).contains(session);
    }

    @Test
    void getById_withExistingId_shouldReturnSession() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        Session result = sessionService.getById(1L);

        assertThat(result).isEqualTo(session);
    }

    @Test
    void getById_withNonExistingId_shouldThrowNotFoundException() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.getById(99L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void update_shouldSetIdAndSaveSession() {
        Session updated = Session.builder().name("Updated").date(new Date()).description("new desc").users(new ArrayList<>()).build();
        when(sessionRepository.save(updated)).thenReturn(updated);

        Session result = sessionService.update(1L, updated);

        assertThat(result.getId()).isEqualTo(1L);
        verify(sessionRepository).save(updated);
    }

    @Test
    void participate_withValidUserAndSession_shouldAddUserToSession() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));

        sessionService.participate(1L, 1L);

        assertThat(session.getUsers()).contains(user1);
        verify(sessionRepository).save(session);
    }

    @Test
    void participate_withAlreadyParticipatingUser_shouldThrowBadRequestException() {
        session.getUsers().add(user1);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));

        assertThatThrownBy(() -> sessionService.participate(1L, 1L))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void participate_withNonExistingSession_shouldThrowNotFoundException() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.participate(99L, 1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void participate_withNonExistingUser_shouldThrowNotFoundException() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.participate(1L, 99L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void noLongerParticipate_withParticipatingUser_shouldRemoveUserFromSession() {
        session.getUsers().add(user1);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        sessionService.noLongerParticipate(1L, 1L);

        assertThat(session.getUsers()).doesNotContain(user1);
        verify(sessionRepository).save(session);
    }

    @Test
    void noLongerParticipate_withNonParticipatingUser_shouldThrowBadRequestException() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 1L))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void noLongerParticipate_withNonExistingSession_shouldThrowNotFoundException() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.noLongerParticipate(99L, 1L))
                .isInstanceOf(NotFoundException.class);
    }
}

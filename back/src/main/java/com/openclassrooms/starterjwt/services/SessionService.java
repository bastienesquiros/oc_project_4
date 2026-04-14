package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SessionService {
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    public SessionService(SessionRepository sessionRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    public Session create(Session session) {
        return sessionRepository.save(session);
    }

    public void delete(Long id) {
        sessionRepository.findById(id).orElseThrow(NotFoundException::new);
        sessionRepository.deleteById(id);
    }

    public List<Session> findAll() {
        return sessionRepository.findAll();
    }

    public Session getById(Long id) {
        return sessionRepository.findById(id).orElseThrow(NotFoundException::new);
    }

    public Session update(Long id, Session session) {
        session.setId(id);
        return sessionRepository.save(session);
    }

    public void participate(Long id, Long userId) {
        Session session = sessionRepository.findById(id).orElseThrow(NotFoundException::new);
        User user = userRepository.findById(userId).orElseThrow(NotFoundException::new);

        if (session.getUsers().stream().anyMatch(u -> u.getId().equals(userId))) {
            throw new BadRequestException();
        }

        session.getUsers().add(user);
        sessionRepository.save(session);
    }

    public void noLongerParticipate(Long id, Long userId) {
        Session session = sessionRepository.findById(id).orElseThrow(NotFoundException::new);

        if (session.getUsers().stream().noneMatch(u -> u.getId().equals(userId))) {
            throw new BadRequestException();
        }

        session.setUsers(session.getUsers().stream()
                .filter(u -> !u.getId().equals(userId))
                .toList());
        sessionRepository.save(session);
    }
}

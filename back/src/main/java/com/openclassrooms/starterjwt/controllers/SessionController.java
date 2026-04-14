package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.services.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/session")
public class SessionController {
    private final SessionMapper sessionMapper;
    private final SessionService sessionService;

    public SessionController(SessionService sessionService, SessionMapper sessionMapper) {
        this.sessionMapper = sessionMapper;
        this.sessionService = sessionService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(sessionMapper.toDto(sessionService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<List<SessionDto>> findAll() {
        return ResponseEntity.ok(sessionMapper.toDto(sessionService.findAll()));
    }

    @PostMapping
    public ResponseEntity<SessionDto> create(@Valid @RequestBody SessionDto sessionDto) {
        return ResponseEntity.ok(sessionMapper.toDto(sessionService.create(sessionMapper.toEntity(sessionDto))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionDto> update(@PathVariable Long id, @Valid @RequestBody SessionDto sessionDto) {
        return ResponseEntity.ok(sessionMapper.toDto(sessionService.update(id, sessionMapper.toEntity(sessionDto))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sessionService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/participate/{userId}")
    public ResponseEntity<Void> participate(@PathVariable Long id, @PathVariable Long userId) {
        sessionService.participate(id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/participate/{userId}")
    public ResponseEntity<Void> noLongerParticipate(@PathVariable Long id, @PathVariable Long userId) {
        sessionService.noLongerParticipate(id, userId);
        return ResponseEntity.ok().build();
    }
}

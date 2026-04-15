package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.AbstractIT;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SessionControllerIT extends AbstractIT {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String jwtToken;
    private Teacher teacher;
    private Teacher teacher2;
    private User testUser;
    private Session testSession;

    private static final String TEST_EMAIL = "session-test@test.com";
    private static final String TEST_PASSWORD = "Test1234!";

    @BeforeEach
    void setUp() throws Exception {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User(TEST_EMAIL, "Doe", "John", passwordEncoder.encode(TEST_PASSWORD));
        testUser = userRepository.save(testUser);

        teacher = Teacher.builder().firstName("Alice").lastName("Martin").build();
        teacher = teacherRepository.save(teacher);

        teacher2 = Teacher.builder().firstName("Bob").lastName("Smith").build();
        teacher2 = teacherRepository.save(teacher2);

        testSession = Session.builder()
                .name("Yoga Morning")
                .date(new Date())
                .description("A great morning yoga session")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();
        testSession = sessionRepository.save(testSession);

        jwtToken = loginAndGetToken(TEST_EMAIL, TEST_PASSWORD);
    }

    @AfterEach
    void tearDown() {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void findById_withExistingSession_shouldReturn200WithSession() throws Exception {
        mockMvc.perform(get("/api/session/" + testSession.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga Morning"))
                .andExpect(jsonPath("$.teacher_id").value(teacher.getId()));
    }

    @Test
    void findById_withNonExistingSession_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/session/9999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void findAll_shouldReturn200WithListOfSessions() throws Exception {
        mockMvc.perform(get("/api/session")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Yoga Morning"));
    }

    @Test
    void create_withValidPayload_shouldReturn200WithCreatedSession() throws Exception {
        SessionDto dto = new SessionDto();
        dto.setName("Evening Yoga");
        dto.setDate(new Date());
        dto.setDescription("A calming evening session");
        dto.setTeacherId(teacher2.getId());

        mockMvc.perform(post("/api/session")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Evening Yoga"));
    }

    @Test
    void update_withValidPayload_shouldReturn200WithUpdatedSession() throws Exception {
        SessionDto dto = new SessionDto();
        dto.setName("Updated Session");
        dto.setDate(new Date());
        dto.setDescription("Updated description");
        dto.setTeacherId(teacher.getId());

        mockMvc.perform(put("/api/session/" + testSession.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Session"));
    }

    @Test
    void delete_withExistingSession_shouldReturn200() throws Exception {
        mockMvc.perform(delete("/api/session/" + testSession.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());
    }

    @Test
    void delete_withNonExistingSession_shouldReturn404() throws Exception {
        mockMvc.perform(delete("/api/session/9999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void participate_withValidUserAndSession_shouldReturn200() throws Exception {
        mockMvc.perform(post("/api/session/" + testSession.getId() + "/participate/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());
    }

    @Test
    void participate_withAlreadyParticipatingUser_shouldReturn400() throws Exception {
        // First participation
        mockMvc.perform(post("/api/session/" + testSession.getId() + "/participate/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // Second participation should fail
        mockMvc.perform(post("/api/session/" + testSession.getId() + "/participate/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void noLongerParticipate_afterParticipating_shouldReturn200() throws Exception {
        // Add participation
        mockMvc.perform(post("/api/session/" + testSession.getId() + "/participate/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // Remove participation
        mockMvc.perform(delete("/api/session/" + testSession.getId() + "/participate/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());
    }

    @Test
    void noLongerParticipate_whenNotParticipating_shouldReturn400() throws Exception {
        mockMvc.perform(delete("/api/session/" + testSession.getId() + "/participate/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void findById_withoutAuthentication_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/session/" + testSession.getId()))
                .andExpect(status().isUnauthorized());
    }
}

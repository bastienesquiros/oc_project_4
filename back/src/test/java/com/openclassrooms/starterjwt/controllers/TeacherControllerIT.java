package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.AbstractIT;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TeacherControllerIT extends AbstractIT {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String jwtToken;
    private Teacher teacher;

    private static final String TEST_EMAIL = "teacher-test@test.com";
    private static final String TEST_PASSWORD = "Test1234!";

    @BeforeEach
    void setUp() throws Exception {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        User testUser = new User(TEST_EMAIL, "Doe", "John", passwordEncoder.encode(TEST_PASSWORD));
        userRepository.save(testUser);

        teacher = Teacher.builder().firstName("Alice").lastName("Martin").build();
        teacher = teacherRepository.save(teacher);

        jwtToken = loginAndGetToken(TEST_EMAIL, TEST_PASSWORD);
    }

    @AfterEach
    void tearDown() {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void findAll_shouldReturn200WithListOfTeachers() throws Exception {
        mockMvc.perform(get("/api/teacher")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].lastName").value("Martin"));
    }

    @Test
    void findById_withExistingTeacher_shouldReturn200WithTeacher() throws Exception {
        mockMvc.perform(get("/api/teacher/" + teacher.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alice"))
                .andExpect(jsonPath("$.lastName").value("Martin"));
    }

    @Test
    void findById_withNonExistingTeacher_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/teacher/9999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void findAll_withoutAuthentication_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isUnauthorized());
    }
}

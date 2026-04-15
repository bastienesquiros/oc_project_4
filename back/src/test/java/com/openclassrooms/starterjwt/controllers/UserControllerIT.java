package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.AbstractIT;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserControllerIT extends AbstractIT {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private User otherUser;
    private String jwtToken;
    private String otherJwtToken;

    private static final String TEST_EMAIL = "user-ctrl-test@test.com";
    private static final String OTHER_EMAIL = "other-ctrl-test@test.com";
    private static final String TEST_PASSWORD = "Test1234!";

    @BeforeEach
    void setUp() throws Exception {
        sessionRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User(TEST_EMAIL, "Doe", "John", passwordEncoder.encode(TEST_PASSWORD));
        testUser = userRepository.save(testUser);

        otherUser = new User(OTHER_EMAIL, "Smith", "Jane", passwordEncoder.encode(TEST_PASSWORD));
        otherUser = userRepository.save(otherUser);

        jwtToken = loginAndGetToken(TEST_EMAIL, TEST_PASSWORD);
        otherJwtToken = loginAndGetToken(OTHER_EMAIL, TEST_PASSWORD);
    }

    @AfterEach
    void tearDown() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void findById_withExistingUser_shouldReturn200WithUser() throws Exception {
        mockMvc.perform(get("/api/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.lastName").value("Doe"));
    }

    @Test
    void findById_withNonExistingUser_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/user/9999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_asOwner_shouldReturn200() throws Exception {
        mockMvc.perform(delete("/api/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());
    }

    @Test
    void delete_asAnotherUser_shouldReturn401() throws Exception {
        mockMvc.perform(delete("/api/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + otherJwtToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void findById_withoutAuthentication_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/user/" + testUser.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void delete_withNonExistingUser_shouldReturn404() throws Exception {
        mockMvc.perform(delete("/api/user/9999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }
}

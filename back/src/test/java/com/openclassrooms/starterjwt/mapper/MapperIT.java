package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.AbstractIT;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.dto.UserDto;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MapperIT extends AbstractIT {

    @Autowired
    private TeacherMapper teacherMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private SessionMapper sessionMapper;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Teacher teacher;
    private User user;

    @BeforeEach
    void setUp() {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        teacher = Teacher.builder().firstName("Alice").lastName("Martin").build();
        teacher = teacherRepository.save(teacher);

        user = new User("mapper-test@test.com", "Doe", "John", passwordEncoder.encode("pass"));
        user = userRepository.save(user);
    }

    @AfterEach
    void tearDown() {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();
    }

    // ── TeacherMapper ────────────────────────────────────────────────────────

    @Test
    void teacherMapper_toEntity_shouldMapDtoToTeacher() {
        TeacherDto dto = new TeacherDto();
        dto.setId(teacher.getId());
        dto.setFirstName("Alice");
        dto.setLastName("Martin");

        Teacher result = teacherMapper.toEntity(dto);

        assertThat(result.getFirstName()).isEqualTo("Alice");
        assertThat(result.getLastName()).isEqualTo("Martin");
    }

    @Test
    void teacherMapper_toEntity_withNull_shouldReturnNull() {
        assertThat(teacherMapper.toEntity((TeacherDto) null)).isNull();
    }

    @Test
    void teacherMapper_toDto_withNull_shouldReturnNull() {
        assertThat(teacherMapper.toDto((Teacher) null)).isNull();
    }

    @Test
    void teacherMapper_toDtoList_withNull_shouldReturnNull() {
        assertThat(teacherMapper.toDto((List<Teacher>) null)).isNull();
    }

    @Test
    void teacherMapper_toEntityList_shouldMapList() {
        TeacherDto dto = new TeacherDto();
        dto.setId(teacher.getId());
        dto.setFirstName("Alice");
        dto.setLastName("Martin");

        List<Teacher> result = teacherMapper.toEntity(List.of(dto));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFirstName()).isEqualTo("Alice");
    }

    @Test
    void teacherMapper_toEntityList_withNull_shouldReturnNull() {
        assertThat(teacherMapper.toEntity((List<TeacherDto>) null)).isNull();
    }

    // ── UserMapper ───────────────────────────────────────────────────────────

    @Test
    void userMapper_toEntity_shouldMapDtoToUser() {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail("mapper-test@test.com");
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setAdmin(false);
        dto.setPassword("hashed_password");  // @NonNull on User.password requires this

        User result = userMapper.toEntity(dto);

        assertThat(result.getEmail()).isEqualTo("mapper-test@test.com");
        assertThat(result.getFirstName()).isEqualTo("John");
    }

    @Test
    void userMapper_toEntity_withNull_shouldReturnNull() {
        assertThat(userMapper.toEntity((UserDto) null)).isNull();
    }

    @Test
    void userMapper_toDto_withNull_shouldReturnNull() {
        assertThat(userMapper.toDto((User) null)).isNull();
    }

    @Test
    void userMapper_toDtoList_withNull_shouldReturnNull() {
        assertThat(userMapper.toDto((List<User>) null)).isNull();
    }

    @Test
    void userMapper_toEntityList_shouldMapList() {
        UserDto dto = new UserDto();
        dto.setEmail("mapper-test@test.com");
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setPassword("hashed_password");  // @NonNull on User.password requires this

        List<User> result = userMapper.toEntity(List.of(dto));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("mapper-test@test.com");
    }

    @Test
    void userMapper_toEntityList_withNull_shouldReturnNull() {
        assertThat(userMapper.toEntity((List<UserDto>) null)).isNull();
    }

    // ── SessionMapper ────────────────────────────────────────────────────────

    @Test
    void sessionMapper_toDto_shouldMapSessionToDto() {
        Session session = Session.builder()
                .name("Yoga")
                .date(new Date())
                .description("desc")
                .teacher(teacher)
                .users(List.of(user))
                .build();
        session = sessionRepository.save(session);

        SessionDto dto = sessionMapper.toDto(session);

        assertThat(dto.getName()).isEqualTo("Yoga");
        assertThat(dto.getTeacherId()).isEqualTo(teacher.getId());
        assertThat(dto.getUsers()).contains(user.getId());
    }

    @Test
    void sessionMapper_toDto_withNullUsersAndTeacher_shouldReturnEmptyUsers() {
        Session session = Session.builder()
                .name("Yoga")
                .date(new Date())
                .description("desc")
                .teacher(null)
                .users(null)
                .build();
        session = sessionRepository.save(session);

        SessionDto dto = sessionMapper.toDto(session);

        assertThat(dto.getTeacherId()).isNull();
        assertThat(dto.getUsers()).isEmpty();
    }

    @Test
    void sessionMapper_toEntity_shouldMapDtoToSession() {
        SessionDto dto = new SessionDto();
        dto.setName("Yoga");
        dto.setDate(new Date());
        dto.setDescription("desc");
        dto.setTeacherId(teacher.getId());
        dto.setUsers(List.of(user.getId()));

        Session session = sessionMapper.toEntity(dto);

        assertThat(session.getName()).isEqualTo("Yoga");
        assertThat(session.getTeacher().getId()).isEqualTo(teacher.getId());
        assertThat(session.getUsers()).hasSize(1);
    }

    @Test
    void sessionMapper_toEntity_withNullTeacherAndEmptyUsers_shouldHandleGracefully() {
        SessionDto dto = new SessionDto();
        dto.setName("Yoga");
        dto.setDate(new Date());
        dto.setDescription("desc");
        dto.setTeacherId(null);
        dto.setUsers(new ArrayList<>());

        Session session = sessionMapper.toEntity(dto);

        assertThat(session.getTeacher()).isNull();
        assertThat(session.getUsers()).isEmpty();
    }

    @Test
    void sessionMapper_toDtoList_shouldMapList() {
        Session session = Session.builder()
                .name("Yoga")
                .date(new Date())
                .description("desc")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();
        session = sessionRepository.save(session);

        List<SessionDto> result = sessionMapper.toDto(List.of(session));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Yoga");
    }

    @Test
    void sessionMapper_toEntityList_shouldMapList() {
        SessionDto dto = new SessionDto();
        dto.setName("Yoga");
        dto.setDate(new Date());
        dto.setDescription("desc");
        dto.setTeacherId(teacher.getId());
        dto.setUsers(new ArrayList<>());

        List<Session> result = sessionMapper.toEntity(List.of(dto));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Yoga");
    }
}

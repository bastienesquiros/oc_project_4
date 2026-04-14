package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@Mapper(componentModel = "spring", imports = {Collections.class, Optional.class, List.class, User.class})
public abstract class SessionMapper implements EntityMapper<SessionDto, Session> {

    @Autowired
    TeacherService teacherService;
    @Autowired
    UserService userService;

    @Mapping(target = "teacher", expression = "java(sessionDto.getTeacherId() != null ? this.teacherService.findById(sessionDto.getTeacherId()) : null)")
    @Mapping(target = "users", expression = "java(Optional.ofNullable(sessionDto.getUsers()).orElseGet(Collections::emptyList).stream().map(userId -> this.userService.findById(userId)).toList())")
    public abstract Session toEntity(SessionDto sessionDto);

    @Mapping(source = "teacher.id", target = "teacherId")
    @Mapping(target = "users", expression = "java(Optional.ofNullable(session.getUsers()).orElseGet(Collections::emptyList).stream().map(User::getId).toList())")
    public abstract SessionDto toDto(Session session);
}

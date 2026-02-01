package org.project.backend.mapper;

import org.project.backend.dto.users.UserRequest;
import org.project.backend.dto.users.UserResponse;
import org.project.backend.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserRequest userRequest) {
        if (userRequest == null) {
            return null;
        }
        return User.builder()
                .nom(userRequest.getNom())
                .email(userRequest.getEmail())
                .motDePasse(userRequest.getMotDePasse())
                .role(userRequest.getRole())
                .build();
    }

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .idUser(user.getIdUser())
                .nom(user.getNom())
                .email(user.getEmail())
                .role(user.getRole())
                .dateCreation(user.getDateCreation())
                .build();
    }

    public void updateEntityFromRequest(User user, UserRequest userRequest) {
        if (user == null || userRequest == null) {
            return;
        }
        user.setNom(userRequest.getNom());
        user.setEmail(userRequest.getEmail());

        if (userRequest.getMotDePasse() != null && !userRequest.getMotDePasse().isEmpty()) {
            user.setMotDePasse(userRequest.getMotDePasse());
        }
        user.setRole(userRequest.getRole());
    }
}


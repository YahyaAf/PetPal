package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.users.UserRequest;
import org.project.backend.dto.users.UserResponse;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.UserMapper;
import org.project.backend.model.User;
import org.project.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional
    public UserResponse create(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new DuplicateResourceException("User", "email", userRequest.getEmail());
        }

        User user = userMapper.toEntity(userRequest);
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Transactional
    public UserResponse update(Integer id, UserRequest userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (!user.getEmail().equals(userRequest.getEmail()) &&
                userRepository.existsByEmail(userRequest.getEmail())) {
            throw new DuplicateResourceException("User", "email", userRequest.getEmail());
        }

        userMapper.updateEntityFromRequest(user, userRequest);
        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toResponse(user);
    }

    @Transactional
    public void delete(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return userRepository.count();
    }
}

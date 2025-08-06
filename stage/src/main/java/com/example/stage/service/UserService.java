package com.example.stage.service;

import com.example.stage.entity.User;
import com.example.stage.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserKeycloakSynchronizer keycloakSynchronizer;

    public UserService(UserRepository userRepository, UserKeycloakSynchronizer keycloakSynchronizer) {
        this.userRepository = userRepository;
        this.keycloakSynchronizer = keycloakSynchronizer;
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public void deleteUser(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            userRepository.delete(user);
            keycloakSynchronizer.deleteUserInKeycloak(username);
        });
    }
} 
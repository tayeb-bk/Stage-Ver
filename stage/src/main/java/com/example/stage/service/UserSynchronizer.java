package com.example.stage.service;

import com.example.stage.entity.User;
import com.example.stage.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.jwt.Jwt;

@Service
public class UserSynchronizer {
    @Autowired
    private UserRepository userRepository;

    public User synchronizeUser(Jwt jwt) {
        String keycloakId = jwt.getSubject();
        String email = jwt.getClaim("email");
        String firstName = jwt.getClaim("given_name");
        String lastName = jwt.getClaim("family_name");

        return userRepository.findById(keycloakId)
            .orElseGet(() -> {
                User user = new User();
                user.setId(keycloakId);
                user.setEmail(email);
                user.setFirstName(firstName);
                user.setLastName(lastName);
                return userRepository.save(user);
            });
    }
} 
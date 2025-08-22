package com.example.stage.service;

import com.example.stage.entity.User;
import com.example.stage.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserSynchronizer {

    private final UserRepository userRepository;

    public UserSynchronizer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User synchronizeUser(Jwt jwt) {
        String keycloakId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");

        Optional<User> optUser = userRepository.findById(keycloakId);

        if (optUser.isPresent()) {
            User user = optUser.get();
            boolean updated = false;

            if (email != null && !email.equals(user.getEmail())) {
                user.setEmail(email);
                updated = true;
            }
            if (firstName != null && !firstName.equals(user.getFirstName())) {
                user.setFirstName(firstName);
                updated = true;
            }
            if (lastName != null && !lastName.equals(user.getLastName())) {
                user.setLastName(lastName);
                updated = true;
            }

            if (updated) {
                user = userRepository.save(user);
            }
            return user;
        } else {
            User user = new User();
            user.setId(keycloakId);
            user.setUsername(jwt.getClaimAsString("preferred_username")); // ✅ important
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            return userRepository.save(user);
        }

    }
}

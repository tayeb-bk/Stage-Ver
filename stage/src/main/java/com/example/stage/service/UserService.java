package com.example.stage.service;

import com.example.stage.entity.User;
import com.example.stage.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserKeycloakSynchronizer keycloakSynchronizer;
    private final UserSynchronizer userSynchronizer; // Ajouter cette ligne

    public UserService(UserRepository userRepository,
                       UserKeycloakSynchronizer keycloakSynchronizer,
                       UserSynchronizer userSynchronizer) { // Ajouter ce paramètre
        this.userRepository = userRepository;
        this.keycloakSynchronizer = keycloakSynchronizer;
        this.userSynchronizer = userSynchronizer; // Ajouter cette ligne
    }

    // Nouvelle méthode pour récupérer l'utilisateur courant avec synchronisation
    public User getCurrentUser(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return userSynchronizer.synchronizeUser(jwt);
        }
        return null;
    }

    // Méthode pour synchroniser un utilisateur à partir d'un JWT
    public User synchronizeUserFromJwt(Jwt jwt) {
        return userSynchronizer.synchronizeUser(jwt);
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
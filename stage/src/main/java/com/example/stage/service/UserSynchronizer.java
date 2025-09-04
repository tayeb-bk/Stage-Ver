package com.example.stage.service;

import com.example.stage.entity.Role;
import com.example.stage.entity.User;
import com.example.stage.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
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
        String username = jwt.getClaimAsString("preferred_username");

        // Extraction du rôle depuis le JWT selon la priorité
        Role roleFromJwt = extractRoleFromJwt(jwt);

        Optional<User> optUser = userRepository.findById(keycloakId);

        if (optUser.isPresent()) {
            User user = optUser.get();
            boolean updated = false;

            if (username != null && !username.equals(user.getUsername())) {
                user.setUsername(username);
                updated = true;
            }
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

            // Mise à jour du rôle uniquement si assigné dans Keycloak
            if (roleFromJwt != null && roleFromJwt != user.getRole()) {
                user.setRole(roleFromJwt);
                updated = true;
            }

            if (updated) {
                user = userRepository.save(user);
            }

            return user;
        } else {
            // Création d'un nouvel utilisateur avec le rôle assigné dans Keycloak
            User user = new User();
            user.setId(keycloakId);
            user.setUsername(username);
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(roleFromJwt != null ? roleFromJwt : Role.ROLE_MEMBER);

            return userRepository.save(user);
        }
    }

    /**
     * Extraction du rôle depuis le JWT selon la priorité
     * PRIORITE: HEAD_MARKET > OFFICER > TMANAGER > PMANAGER > MEMBER
     */
    private Role extractRoleFromJwt(Jwt jwt) {
        List<Role> priority = List.of(
                Role.ROLE_HEAD_MARKET,
                Role.ROLE_OFFICER,
                Role.ROLE_TMANAGER,
                Role.ROLE_PMANAGER,
                Role.ROLE_MEMBER
        );

        // Récupérer tous les rôles assignés dans le JWT
        List<String> userRoles = new java.util.ArrayList<>();

        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.get("roles") instanceof List<?> rolesList) {
            for (Object r : rolesList) {
                if (r instanceof String roleString) userRoles.add(roleString);
            }
        }

        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess != null) {
            for (Object clientAccess : resourceAccess.values()) {
                if (clientAccess instanceof Map<?, ?> clientMap) {
                    Object rolesObj = clientMap.get("roles");
                    if (rolesObj instanceof List<?> rolesList) {
                        for (Object r : rolesList) {
                            if (r instanceof String roleString) userRoles.add(roleString);
                        }
                    }
                }
            }
        }

        // Vérifier la priorité et retourner le premier rôle assigné
        for (Role pr : priority) {
            for (String ur : userRoles) {
                Role r = convertStringToRole(ur);
                if (pr.equals(r)) return r;
            }
        }

        return Role.ROLE_MEMBER; // Par défaut si aucun rôle assigné
    }

    /**
     * Conversion d'une chaîne Keycloak vers enum Role
     */
    private Role convertStringToRole(String roleString) {
        if (roleString == null) return null;

        try {
            return Role.valueOf(roleString);
        } catch (IllegalArgumentException e1) {
            try {
                return Role.valueOf("ROLE_" + roleString.toUpperCase());
            } catch (IllegalArgumentException e2) {
                try {
                    return Role.valueOf(roleString.toUpperCase());
                } catch (IllegalArgumentException e3) {
                    try {
                        String normalized = roleString.toUpperCase().replace("-", "_");
                        if (!normalized.startsWith("ROLE_")) normalized = "ROLE_" + normalized;
                        return Role.valueOf(normalized);
                    } catch (IllegalArgumentException e4) {
                        return null;
                    }
                }
            }
        }
    }
}

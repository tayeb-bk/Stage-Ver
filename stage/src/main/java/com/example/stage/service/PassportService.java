package com.example.stage.service;

import com.example.stage.entity.Passport;
import com.example.stage.entity.User;
import com.example.stage.repository.PassportRepository;
import com.example.stage.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PassportService {
    private final PassportRepository passportRepository;
    private final UserRepository userRepository;

    public PassportService(PassportRepository passportRepository, UserRepository userRepository) {
        this.passportRepository = passportRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return userRepository.findById(jwt.getSubject())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé en base"));
        }
        throw new RuntimeException("Non authentifié");
    }

    public List<Passport> getAllForCurrentUser() {
        User currentUser = getCurrentUser();
        return passportRepository.findByOwner(currentUser);
    }

    public Optional<Passport> getById(Long id) {
        User currentUser = getCurrentUser();
        return passportRepository.findById(id)
                .filter(passport -> passport.getOwner().getId().equals(currentUser.getId()));
    }

    public Passport create(Passport passport) {
        User currentUser = getCurrentUser();
        passport.setOwner(currentUser);
        return passportRepository.save(passport);
    }

    public Passport update(Long id, Passport passport) {
        User currentUser = getCurrentUser();
        return passportRepository.findById(id)
                .filter(p -> p.getOwner().getId().equals(currentUser.getId()))
                .map(p -> {
                    passport.setId(id);
                    passport.setOwner(currentUser);
                    return passportRepository.save(passport);
                })
                .orElseThrow(() -> new RuntimeException("Passport introuvable ou accès interdit"));
    }

    public void delete(Long id) {
        User currentUser = getCurrentUser();
        passportRepository.findById(id)
                .filter(p -> p.getOwner().getId().equals(currentUser.getId()))
                .ifPresentOrElse(passportRepository::delete,
                        () -> { throw new RuntimeException("Suppression interdite"); });
    }
}


package com.example.stage.service;

import com.example.stage.entity.Role;
import com.example.stage.entity.TravelRequest;
import com.example.stage.entity.User;
import com.example.stage.repository.TravelRequestRepository;
import com.example.stage.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class TravelRequestService {

    private final TravelRequestRepository travelRequestRepository;
    private final UserRepository userRepository;

    public TravelRequestService(TravelRequestRepository travelRequestRepository, UserRepository userRepository) {
        this.travelRequestRepository = travelRequestRepository;
        this.userRepository = userRepository;
    }





    // ✅ Récupérer l'utilisateur courant depuis le JWT
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return userRepository.findById(jwt.getSubject())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        }
        throw new RuntimeException("Non authentifié");
    }

    // ✅ GET : TravelRequests filtré selon rôle
    public List<TravelRequest> getAllTravelRequests() {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.ROLE_MEMBER) {
            // Membre → seulement ses propres demandes
            return travelRequestRepository.findByRequester(currentUser);
        } else {
            // Autres rôles → toutes les demandes
            return travelRequestRepository.findAll();
        }
    }














    public TravelRequest getTravelRequest(Long id) {
        return travelRequestRepository.findById(id).orElseThrow();
    }

    public TravelRequest createTravelRequest(TravelRequest request) {
        // ✅ Toujours statut PENDING à la création
        request.setStatus("PENDING");

        // ✅ Toujours version 1 à la création
        request.setVersion(1);

        // ✅ Calcul automatique de la durée si dates présentes
        if (request.getDepartureDate() != null && request.getReturnDate() != null) {
            if (request.getReturnDate().isBefore(request.getDepartureDate())) {
                throw new IllegalArgumentException("La date de retour ne peut pas être avant la date de départ");
            }
            long duration = ChronoUnit.DAYS.between(request.getDepartureDate(), request.getReturnDate());
            request.setDuration((int) duration);
        }

        return travelRequestRepository.save(request);
    }

    public TravelRequest updateTravelRequest(Long id, TravelRequest request) {
        request.setId(id);

        // ✅ Incrémenter la version à chaque update
        TravelRequest existing = travelRequestRepository.findById(id).orElseThrow();
        request.setVersion(existing.getVersion() + 1);

        // ✅ Recalculer durée si dates changées
        if (request.getDepartureDate() != null && request.getReturnDate() != null) {
            if (request.getReturnDate().isBefore(request.getDepartureDate())) {
                throw new IllegalArgumentException("La date de retour ne peut pas être avant la date de départ");
            }
            long duration = ChronoUnit.DAYS.between(request.getDepartureDate(), request.getReturnDate());
            request.setDuration((int) duration);
        }

        return travelRequestRepository.save(request);
    }

    public void deleteTravelRequest(Long id) {
        travelRequestRepository.deleteById(id);
    }
}


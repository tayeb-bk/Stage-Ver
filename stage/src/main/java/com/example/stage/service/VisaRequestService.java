package com.example.stage.service;

import com.example.stage.entity.Passport;
import com.example.stage.entity.Role;
import com.example.stage.entity.User;
import com.example.stage.entity.VisaRequest;
import com.example.stage.repository.PassportRepository;
import com.example.stage.repository.UserRepository;
import com.example.stage.repository.VisaRequestRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VisaRequestService {

    private final VisaRequestRepository visaRequestRepository;

    private final PassportRepository passportRepository;
    private final UserRepository userRepository; // injecté dans le service

    public VisaRequestService(VisaRequestRepository visaRequestRepository, PassportRepository passportRepository, UserRepository userRepository) {
        this.visaRequestRepository = visaRequestRepository;
        this.passportRepository = passportRepository;
        this.userRepository = userRepository;
    }
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return userRepository.findById(jwt.getSubject())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        }
        throw new RuntimeException("Non authentifié");
    }
    public List<VisaRequest> getAllVisaRequests() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.ROLE_MEMBER) {
            List<Passport> passports = passportRepository.findByOwner(currentUser);
            return visaRequestRepository.findByPassportIn(passports);
        } else {
            return visaRequestRepository.findAll();
        }
    }


    public Optional<VisaRequest> getVisaRequestById(Long id) {
        return visaRequestRepository.findById(id);
    }

    public VisaRequest createVisaRequest(VisaRequest visaRequest, Long passportId) {
        Passport passport = passportRepository.findById(passportId)
                .orElseThrow(() -> new RuntimeException("Passport not found"));

        visaRequest.setPassport(passport); // ✅ lien obligatoire
        visaRequest.setStatus("PENDING");  // par défaut

        return visaRequestRepository.save(visaRequest);
    }

    public VisaRequest updateVisaRequest(Long id, VisaRequest updatedRequest) {
        return visaRequestRepository.findById(id).map(existing -> {
            existing.setMissionPurpose(updatedRequest.getMissionPurpose());
            existing.setDateOfMission(updatedRequest.getDateOfMission());
            existing.setCountryOfFirstMission(updatedRequest.getCountryOfFirstMission()); // ✅ corrigé
            existing.setCountryIssuingVisa(updatedRequest.getCountryIssuingVisa());
            existing.setTravelerType(updatedRequest.getTravelerType());
            existing.setPassport(updatedRequest.getPassport());
            existing.setPassportNumber(updatedRequest.getPassportNumber());
            existing.setIssueDate(updatedRequest.getIssueDate());
            existing.setExpiryDate(updatedRequest.getExpiryDate());
            existing.setIssuingCountry(updatedRequest.getIssuingCountry());
            existing.setIssuedBy(updatedRequest.getIssuedBy());
            existing.setStatus(updatedRequest.getStatus());

            return visaRequestRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("VisaRequest not found with id " + id));
    }

    public void deleteVisaRequest(Long id) {
        visaRequestRepository.deleteById(id);
    }
}

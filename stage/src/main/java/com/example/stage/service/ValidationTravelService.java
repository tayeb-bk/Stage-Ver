package com.example.stage.service;

import com.example.stage.entity.TravelRequest;
import com.example.stage.repository.TravelRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ValidationTravelService {

    private final TravelRequestRepository travelRequestRepository;

    public ValidationTravelService(TravelRequestRepository travelRequestRepository) {
        this.travelRequestRepository = travelRequestRepository;
    }

    // === Etape 1 : validation initiale ===
    public TravelRequest validateStep1(Long id, boolean approved) {
        TravelRequest request = travelRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Travel request not found"));

        if ("PENDING".equals(request.getStatus())) {
            request.setStatus(approved ? "STEP1_APPROVED" : "STEP1_REJECTED");
        }
        return travelRequestRepository.save(request);
    }

    // === Etape 2 : validation finale ===
    public TravelRequest validateStep2(Long id, boolean approved) {
        TravelRequest request = travelRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Travel request not found"));

        if ("STEP1_APPROVED".equals(request.getStatus())) {
            request.setStatus(approved ? "APPROVED" : "REJECTED");
        }
        return travelRequestRepository.save(request);
    }

    // === Affichage par statut ===
    public List<TravelRequest> getByStatus(String status) {
        return travelRequestRepository.findAll()
                .stream()
                .filter(t -> t.getStatus().equalsIgnoreCase(status))
                .toList();
    }

    // === Mettre à jour uniquement le status ===
    public TravelRequest updateStatus(Long id, String newStatus) {
        TravelRequest request = travelRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TravelRequest not found"));
        request.setStatus(newStatus);
        return travelRequestRepository.save(request);
    }

    // === Supprimer ===
    public void deleteTravelRequest(Long id) {
        travelRequestRepository.deleteById(id);
    }
}

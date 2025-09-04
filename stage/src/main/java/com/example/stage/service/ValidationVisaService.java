package com.example.stage.service;

import com.example.stage.entity.VisaRequest;
import com.example.stage.repository.VisaRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ValidationVisaService {

    private final VisaRequestRepository visaRequestRepository;

    public ValidationVisaService(VisaRequestRepository visaRequestRepository) {
        this.visaRequestRepository = visaRequestRepository;
    }


    // === Etape 1 : validation initiale ===
    public VisaRequest validateStep1(Long id, boolean approved) {
        VisaRequest request = visaRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visa request not found"));

        if ("PENDING".equals(request.getStatus())) {
            request.setStatus(approved ? "STEP1_APPROVED" : "STEP1_REJECTED");
        }
        return visaRequestRepository.save(request);
    }



    // === Etape 2 : validation finale ===
    public VisaRequest validateStep2(Long id, boolean approved) {
        VisaRequest request = visaRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visa request not found"));

        if ("STEP1_APPROVED".equals(request.getStatus())) {
            request.setStatus(approved ? "APPROVED" : "REJECTED");
        }
        return visaRequestRepository.save(request);
    }





    // === Affichage par statut ===
    public List<VisaRequest> getByStatus(String status) {
        return visaRequestRepository.findAll()
                .stream()
                .filter(v -> v.getStatus().equalsIgnoreCase(status))
                .toList();
    }

    // === Mettre à jour uniquement le status ===
    public VisaRequest updateStatus(Long id, String newStatus) {
        VisaRequest request = visaRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("VisaRequest not found"));
        request.setStatus(newStatus);
        return visaRequestRepository.save(request);
    }

    // === Supprimer ===
    public void deleteVisaRequest(Long id) {
        visaRequestRepository.deleteById(id);
    }
}



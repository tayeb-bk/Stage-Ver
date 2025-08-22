package com.example.stage.controller;

import com.example.stage.entity.VisaRequest;
import com.example.stage.service.VisaRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visa-requests")
public class VisaRequestController {

    private final VisaRequestService visaRequestService;

    public VisaRequestController(VisaRequestService visaRequestService) {
        this.visaRequestService = visaRequestService;
    }

    // --- GET ALL ---
    @GetMapping("/all")
    public ResponseEntity<List<VisaRequest>> getAllVisaRequests() {
        return ResponseEntity.ok(visaRequestService.getAllVisaRequests());
    }

    // --- GET BY ID ---
    @GetMapping("/{id}")
    public ResponseEntity<VisaRequest> getVisaRequestById(@PathVariable Long id) {
        return visaRequestService.getVisaRequestById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- CREATE ---
    @PostMapping("/create")
    public ResponseEntity<VisaRequest> createVisaRequest(
            @RequestBody VisaRequest visaRequest,
            @RequestParam Long passportId) {
        VisaRequest created = visaRequestService.createVisaRequest(visaRequest, passportId);
        return ResponseEntity.ok(created);
    }

    // --- UPDATE ---
    @PutMapping("/update/{id}")
    public ResponseEntity<VisaRequest> updateVisaRequest(
            @PathVariable Long id,
            @RequestBody VisaRequest updatedRequest) {
        return ResponseEntity.ok(visaRequestService.updateVisaRequest(id, updatedRequest));
    }

    // --- DELETE ---
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteVisaRequest(@PathVariable Long id) {
        visaRequestService.deleteVisaRequest(id);
        return ResponseEntity.noContent().build();
    }
}

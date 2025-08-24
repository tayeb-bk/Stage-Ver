package com.example.stage.controller;

import com.example.stage.entity.TravelRequest;
import com.example.stage.service.TravelRequestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/travel-requests")
@CrossOrigin(origins = "*")
public class TravelRequestController {

    private final TravelRequestService travelRequestService;

    public TravelRequestController(TravelRequestService travelRequestService) {
        this.travelRequestService = travelRequestService;
    }

    // ✅ Récupérer toutes les demandes
    @GetMapping("/all")
    public List<TravelRequest> getAllTravelRequests() {
        return travelRequestService.getAllTravelRequests();
    }

    // ✅ Récupérer une demande par ID
    @GetMapping("/get/{id}")
    public TravelRequest getTravelRequest(@PathVariable Long id) {
        return travelRequestService.getTravelRequest(id);
    }

    // ✅ Créer une nouvelle demande (status = PENDING par défaut)
    @PostMapping(
            value = "/create",
            consumes = { "application/json", "application/json;charset=UTF-8" },
            produces = "application/json"
    )
    public TravelRequest createTravelRequest(@RequestBody TravelRequest request) {
        return travelRequestService.createTravelRequest(request);
    }


    // ✅ Mettre à jour une demande existante (version ++)
    @PutMapping("/update/{id}")
    public TravelRequest updateTravelRequest(@PathVariable Long id, @RequestBody TravelRequest request) {
        return travelRequestService.updateTravelRequest(id, request);
    }

    // ✅ Supprimer une demande
    @DeleteMapping("/delete/{id}")
    public void deleteTravelRequest(@PathVariable Long id) {
        travelRequestService.deleteTravelRequest(id);
    }
}

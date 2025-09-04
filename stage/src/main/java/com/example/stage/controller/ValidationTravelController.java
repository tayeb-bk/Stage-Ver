package com.example.stage.controller;

import com.example.stage.entity.TravelRequest;
import com.example.stage.service.ValidationTravelService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/validation-travels")
@CrossOrigin(origins = "*")
public class ValidationTravelController {

    private final ValidationTravelService validationTravelService;

    public ValidationTravelController(ValidationTravelService validationTravelService) {
        this.validationTravelService = validationTravelService;
    }

    @PutMapping("/step1/{id}")
    public TravelRequest validateStep1(@PathVariable Long id, @RequestParam boolean approved) {
        return validationTravelService.validateStep1(id, approved);
    }

    @PutMapping("/step2/{id}")
    public TravelRequest validateStep2(@PathVariable Long id, @RequestParam boolean approved) {
        return validationTravelService.validateStep2(id, approved);
    }

    @GetMapping("/status/{status}")
    public List<TravelRequest> getByStatus(@PathVariable String status) {
        return validationTravelService.getByStatus(status);
    }

    @PutMapping("/{id}/status")
    public TravelRequest updateStatus(@PathVariable Long id, @RequestParam String status) {
        return validationTravelService.updateStatus(id, status);
    }

    // Suppression spécifique à validation
    @DeleteMapping("/validation/{id}")
    public void deleteValidationTravelRequest(@PathVariable Long id) {
        validationTravelService.deleteTravelRequest(id);
    }
}

package com.example.stage.controller;

import com.example.stage.entity.VisaRequest;
import com.example.stage.service.ValidationVisaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/validation-visas")
@CrossOrigin(origins = "*")
public class ValidationVisaController {

    private final ValidationVisaService validationVisaService;

    public ValidationVisaController(ValidationVisaService validationVisaService) {
        this.validationVisaService = validationVisaService;
    }

    @PutMapping("/step1/{id}")
    public VisaRequest validateStep1(@PathVariable Long id, @RequestParam boolean approved) {
        return validationVisaService.validateStep1(id, approved);
    }

    @PutMapping("/step2/{id}")
    public VisaRequest validateStep2(@PathVariable Long id, @RequestParam boolean approved) {
        return validationVisaService.validateStep2(id, approved);
    }

    @GetMapping("/status/{status}")
    public List<VisaRequest> getByStatus(@PathVariable String status) {
        return validationVisaService.getByStatus(status);
    }


    @PutMapping("/{id}/status")
    public VisaRequest updateStatus(@PathVariable Long id, @RequestParam String status) {
        return validationVisaService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void deleteVisaRequest(@PathVariable Long id) {
        validationVisaService.deleteVisaRequest(id);
    }


}


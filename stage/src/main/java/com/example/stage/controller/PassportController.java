package com.example.stage.controller;

import com.example.stage.entity.Passport;
import com.example.stage.service.PassportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/passports")
public class PassportController {
@Autowired
private final PassportService passportService;

    public PassportController(PassportService passportService) {
        this.passportService = passportService;
    }
    @GetMapping
    public List<Passport> getAll() {
        return passportService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Passport> getById(@PathVariable Long id) {
        return passportService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Passport create(@RequestBody Passport passport) {
        return passportService.create(passport);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Passport> update(@PathVariable Long id, @RequestBody Passport passport) {
        if (!passportService.getById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(passportService.update(id, passport));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!passportService.getById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        passportService.delete(id);
        return ResponseEntity.noContent().build();
    }


}

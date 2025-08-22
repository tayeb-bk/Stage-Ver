package com.example.stage.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter

public class VisaRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- General Informations ---
    private String missionPurpose;        // Objet du déplacement
    private LocalDate dateOfMission;      // Date du premier déplacement
    private String countryOfFirstMission; // Pays premier déplacement
    private String countryIssuingVisa;    // Pays émetteur de visa
    private String travelerType;          // Type de voyageur

    // --- Relation avec Passport ---
    @ManyToOne
    @JoinColumn(name = "passport_id"/*, nullable = false*/)
    private Passport passport;

    // --- Informations Passeport (copiées pour l’historique visa) ---
    private String passportNumber;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String issuingCountry;
    private String issuedBy;

    // --- Workflow ---
    private String status = "PENDING"; // Default: PENDING, APPROVED, REJECTED
}

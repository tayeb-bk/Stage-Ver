package com.example.stage.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
public class Passport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String address;
    private String nationality;
    private LocalDate dateOfBirth;
    private String placeOfBirth;
    private String sex;
    private String occupation;
    private String issuingAuthority;
    private LocalDate dateOfIssue;
    private LocalDate dateOfExpiry;
    private Long passportNumber; // ➝ nombre
    private boolean primaryPassport = true; // checked by default

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User owner;   // ➝ le créateur/propriétaire

    // Relation avec VisaRequest

}
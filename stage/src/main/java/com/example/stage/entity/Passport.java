package com.example.stage.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

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
    private boolean primaryPassport = true; // checked by default


}
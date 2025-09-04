package com.example.stage.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TravelRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;                       // type de déplacement
    private String destination;                // destination principale
    private String secondaryDestination;       // escale optionnelle
    private String objective;                  // objectif / raison du voyage
    @JsonFormat(pattern = "yyyy-MM-dd")   // <-- nécessaire pour Jackson
    private LocalDate departureDate;

    @JsonFormat(pattern = "yyyy-MM-dd")   // <-- nécessaire pour Jackson
    private LocalDate returnDate;

    private Boolean visaRequired;
    private String status;
    private int duration;
    private int version;

    // Relation optionnelle avec User (nullable)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = true)
    private User requester;

    // Relation avec Project
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // Relation avec Mission (doit appartenir au projet)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;
}

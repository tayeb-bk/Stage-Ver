package com.example.stage.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relation avec le voyage
    @OneToOne
    @JoinColumn(name = "travel_request_id", nullable = false)
    private TravelRequest travelRequest;

    // ---- Infos voyageur ----
    private String travelerFirstName;
    private String travelerLastName;
    private String travelerEmail;

    // ---- Ticket ----
    private String ticketNumber;
    private BigDecimal ticketAmount;

    // ---- Hôtel ----
    private String hotelName;
    private BigDecimal pricePerNight;
    private int nights;
    private BigDecimal hotelTotal;

    // ---- Per Diem ----
    private BigDecimal perDiemRate;
    private int travelDays;
    private BigDecimal perDiemTotal;

    // ---- Montant Total ----
    private BigDecimal totalAmount;
}

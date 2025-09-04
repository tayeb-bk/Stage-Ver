package com.example.stage.service;

import com.example.stage.entity.Invoice;
import com.example.stage.entity.TravelRequest;
import com.example.stage.entity.User;
import com.example.stage.repository.InvoiceRepository;
import com.example.stage.repository.TravelRequestRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final TravelRequestRepository travelRequestRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, TravelRequestRepository travelRequestRepository) {
        this.invoiceRepository = invoiceRepository;
        this.travelRequestRepository = travelRequestRepository;
    }

    // 🔹 Générer une facture pour un voyage approuvé
    public Invoice generateInvoice(Long travelRequestId, Invoice invoiceData) {
        TravelRequest travel = travelRequestRepository.findById(travelRequestId)
                .orElseThrow(() -> new RuntimeException("Voyage introuvable"));

        if (!"APPROVED".equalsIgnoreCase(travel.getStatus())) {
            throw new RuntimeException("Impossible de générer une facture pour un voyage non approuvé");
        }

        // Associer le voyage
        invoiceData.setTravelRequest(travel);

        // ---- Copier infos du voyageur ----
        User traveler = travel.getRequester();
        if (traveler != null) {
            invoiceData.setTravelerFirstName(traveler.getFirstName());
            invoiceData.setTravelerLastName(traveler.getLastName());
            invoiceData.setTravelerEmail(traveler.getEmail());
        }

        // ---- Calcul hôtel ----
        int nights = (int) ChronoUnit.DAYS.between(travel.getDepartureDate(), travel.getReturnDate());
        invoiceData.setNights(nights);
        if (invoiceData.getPricePerNight() != null) {
            invoiceData.setHotelTotal(invoiceData.getPricePerNight()
                    .multiply(BigDecimal.valueOf(nights)));
        }

        // ---- Calcul perdiem ----
        int days = (int) ChronoUnit.DAYS.between(travel.getDepartureDate(), travel.getReturnDate()) + 1;
        invoiceData.setTravelDays(days);

        // Pour l’instant, le perdiem est envoyé depuis le front (pas de valeur fixe ici)
        if (invoiceData.getPerDiemRate() != null) {
            invoiceData.setPerDiemTotal(invoiceData.getPerDiemRate()
                    .multiply(BigDecimal.valueOf(days)));
        }

        // ---- Total ----
        BigDecimal total = BigDecimal.ZERO;
        if (invoiceData.getTicketAmount() != null) total = total.add(invoiceData.getTicketAmount());
        if (invoiceData.getHotelTotal() != null) total = total.add(invoiceData.getHotelTotal());
        if (invoiceData.getPerDiemTotal() != null) total = total.add(invoiceData.getPerDiemTotal());

        invoiceData.setTotalAmount(total);

        return invoiceRepository.save(invoiceData);
    }

    // 🔹 Récupérer toutes les factures
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    // 🔹 Récupérer une facture par voyage
    public Invoice getInvoiceByTravel(Long travelRequestId) {
        return invoiceRepository.findByTravelRequestId(travelRequestId)
                .orElseThrow(() -> new RuntimeException("Facture introuvable pour ce voyage"));
    }

    // 🔹 Supprimer une facture
    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }
}

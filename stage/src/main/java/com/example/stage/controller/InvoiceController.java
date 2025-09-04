package com.example.stage.controller;

import com.example.stage.entity.Invoice;
import com.example.stage.service.InvoicePdfService;
import com.example.stage.service.InvoiceService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoicePdfService pdfService;


    public InvoiceController(InvoiceService invoiceService, InvoicePdfService pdfService) {
        this.invoiceService = invoiceService;
        this.pdfService = pdfService;
    }

    // ✅ Générer une facture pour un voyage
    @PostMapping("/generate/{travelRequestId}")
    public Invoice generateInvoice(@PathVariable Long travelRequestId, @RequestBody Invoice invoiceData) {
        return invoiceService.generateInvoice(travelRequestId, invoiceData);
    }

    // ✅ Récupérer toutes les factures
    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    // ✅ Récupérer une facture par voyage
    @GetMapping("/travel/{travelRequestId}")
    public Invoice getInvoiceByTravel(@PathVariable Long travelRequestId) {
        return invoiceService.getInvoiceByTravel(travelRequestId);
    }

    // ✅ Supprimer une facture
    @DeleteMapping("/{id}")
    public void deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
    }

    // 🆕 Télécharger la facture en PDF
    @GetMapping("/download-pdf/{invoiceId}")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long invoiceId) {
        try {
            // Récupérer la facture
            Invoice invoice = invoiceService.getAllInvoices().stream()
                    .filter(inv -> inv.getId().equals(invoiceId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Facture introuvable"));

            // Générer le PDF
            byte[] pdfBytes = pdfService.generateInvoicePdf(invoice);

            // Définir le nom du fichier
            String filename = "Facture_Voyage_" + invoice.getTravelRequest().getId() + "_" +
                    invoice.getTravelRequest().getRequester().getLastName() + ".pdf";

            // Préparer les headers HTTP
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 🆕 Générer et télécharger directement après création
    @PostMapping("/generate-and-download/{travelRequestId}")
    public ResponseEntity<byte[]> generateAndDownloadInvoice(
            @PathVariable Long travelRequestId,
            @RequestBody Invoice invoiceData) {
        try {
            // Générer la facture
            Invoice savedInvoice = invoiceService.generateInvoice(travelRequestId, invoiceData);

            // Générer le PDF
            byte[] pdfBytes = pdfService.generateInvoicePdf(savedInvoice);

            // Définir le nom du fichier
            String filename = "Facture_Voyage_" + savedInvoice.getTravelRequest().getId() + "_" +
                    savedInvoice.getTravelRequest().getRequester().getLastName() + ".pdf";

            // Préparer les headers HTTP
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

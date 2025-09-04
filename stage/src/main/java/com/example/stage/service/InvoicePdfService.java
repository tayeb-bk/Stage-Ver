package com.example.stage.service;

import com.example.stage.entity.Invoice;
import com.example.stage.entity.TravelRequest;
import com.example.stage.entity.User;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;

@Service
public class InvoicePdfService {

    public byte[] generateInvoicePdf(Invoice invoice) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);

            // Polices
            PdfFont titleFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont normalFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            // Sections PDF
            addHeader(document, invoice, titleFont, normalFont);
            addTravelInfo(document, invoice, titleFont, normalFont);
            addTravelerInfo(document, invoice, titleFont, normalFont);
            addCostDetails(document, invoice, titleFont, normalFont);
            addTotal(document, invoice, titleFont);
            addFooter(document, normalFont);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }
    }

    private void addHeader(Document document, Invoice invoice, PdfFont titleFont, PdfFont normalFont) {
        Paragraph header = new Paragraph("FACTURE DE VOYAGE")
                .setFont(titleFont)
                .setFontSize(20)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(header);

        Table table = new Table(2).useAllAvailableWidth();

        // Infos entreprise
        Cell companyCell = new Cell().setBorder(null);
        companyCell.add(new Paragraph("VOTRE ENTREPRISE").setFont(titleFont).setFontSize(12));
        companyCell.add(new Paragraph("Adresse de l'entreprise\nVille, Code postal\nTél: +216 XX XXX XXX").setFont(normalFont).setFontSize(10));
        table.addCell(companyCell);

        // Infos facture
        Cell invoiceCell = new Cell().setBorder(null);
        invoiceCell.setTextAlignment(TextAlignment.RIGHT);
        invoiceCell.add(new Paragraph("Facture N°: " + invoice.getId()).setFont(titleFont));
        invoiceCell.add(new Paragraph("Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))).setFont(normalFont).setFontSize(10));
        table.addCell(invoiceCell);

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void addTravelInfo(Document document, Invoice invoice, PdfFont titleFont, PdfFont normalFont) {
        TravelRequest travel = invoice.getTravelRequest();

        Paragraph title = new Paragraph("INFORMATIONS DU VOYAGE")
                .setFont(titleFont)
                .setFontSize(14)
                .setMarginBottom(10);
        document.add(title);

        Table table = new Table(2).useAllAvailableWidth();
        addTableRow(table, "Voyage ID:", travel != null ? "#" + travel.getId() : "N/A", normalFont);
        addTableRow(table, "Destination principale:", travel != null && travel.getDestination() != null ? travel.getDestination() : "N/A", normalFont);
        addTableRow(table, "Destination secondaire:", travel != null && travel.getSecondaryDestination() != null ? travel.getSecondaryDestination() : "N/A", normalFont);
        addTableRow(table, "Objectif:", travel != null && travel.getObjective() != null ? travel.getObjective() : "N/A", normalFont);
        addTableRow(table, "Type de voyage:", travel != null && travel.getType() != null ? travel.getType() : "N/A", normalFont);
        addTableRow(table, "Date de départ:", travel != null && travel.getDepartureDate() != null ? travel.getDepartureDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A", normalFont);
        addTableRow(table, "Date de retour:", travel != null && travel.getReturnDate() != null ? travel.getReturnDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A", normalFont);

        // ⚠️ Vérification pour éviter erreur sur int
        String durationText = (travel != null && travel.getDuration() > 0) ? travel.getDuration() + " jours" : "N/A";
        addTableRow(table, "Durée:", durationText, normalFont);

        String visaText = (travel != null && travel.getVisaRequired() != null) ? (travel.getVisaRequired() ? "Oui" : "Non") : "N/A";
        addTableRow(table, "Visa requis:", visaText, normalFont);

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void addTravelerInfo(Document document, Invoice invoice, PdfFont titleFont, PdfFont normalFont) {
        TravelRequest travel = invoice.getTravelRequest();
        User requester = travel != null ? travel.getRequester() : null;

        Paragraph title = new Paragraph("INFORMATIONS DU VOYAGEUR")
                .setFont(titleFont)
                .setFontSize(14)
                .setMarginBottom(10);
        document.add(title);

        Table table = new Table(2).useAllAvailableWidth();

        addTableRow(table, "Nom complet:", requester != null ? requester.getFirstName() + " " + requester.getLastName() : "Inconnu", normalFont);
        addTableRow(table, "Email:", requester != null && requester.getEmail() != null ? requester.getEmail() : "N/A", normalFont);
        addTableRow(table, "Username:", requester != null && requester.getUsername() != null ? requester.getUsername() : "N/A", normalFont);

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void addCostDetails(Document document, Invoice invoice, PdfFont titleFont, PdfFont normalFont) {
        Paragraph title = new Paragraph("DÉTAIL DES COÛTS")
                .setFont(titleFont)
                .setFontSize(14)
                .setMarginBottom(10);
        document.add(title);

        Table table = new Table(4).useAllAvailableWidth();

        table.addHeaderCell(new Cell().add(new Paragraph("Description").setFont(titleFont)));
        table.addHeaderCell(new Cell().add(new Paragraph("Quantité").setFont(titleFont)));
        table.addHeaderCell(new Cell().add(new Paragraph("Prix unitaire (DT)").setFont(titleFont)));
        table.addHeaderCell(new Cell().add(new Paragraph("Total (DT)").setFont(titleFont)));

        if (invoice.getTicketAmount() != null && invoice.getTicketAmount().compareTo(BigDecimal.ZERO) > 0) {
            table.addCell(new Cell().add(new Paragraph("Billet d'avion\nN°: " + (invoice.getTicketNumber() != null ? invoice.getTicketNumber() : "N/A"))));
            table.addCell(new Cell().add(new Paragraph("1")));
            table.addCell(new Cell().add(new Paragraph(formatAmount(invoice.getTicketAmount()))));
            table.addCell(new Cell().add(new Paragraph(formatAmount(invoice.getTicketAmount()))));
        }

        if (invoice.getHotelTotal() != null && invoice.getHotelTotal().compareTo(BigDecimal.ZERO) > 0) {
            String nightsText = invoice.getNights() > 0 ? invoice.getNights() + " nuits" : "N/A";
            table.addCell(new Cell().add(new Paragraph("Hébergement\nHôtel: " + (invoice.getHotelName() != null ? invoice.getHotelName() : "N/A"))));
            table.addCell(new Cell().add(new Paragraph(nightsText)));
            table.addCell(new Cell().add(new Paragraph(invoice.getPricePerNight() != null ? formatAmount(invoice.getPricePerNight()) : "N/A")));
            table.addCell(new Cell().add(new Paragraph(formatAmount(invoice.getHotelTotal()))));
        }

        if (invoice.getPerDiemTotal() != null && invoice.getPerDiemTotal().compareTo(BigDecimal.ZERO) > 0) {
            String daysText = invoice.getTravelDays() > 0 ? invoice.getTravelDays() + " jours" : "N/A";
            table.addCell(new Cell().add(new Paragraph("Per Diem")));
            table.addCell(new Cell().add(new Paragraph(daysText)));
            table.addCell(new Cell().add(new Paragraph(invoice.getPerDiemRate() != null ? formatAmount(invoice.getPerDiemRate()) : "N/A")));
            table.addCell(new Cell().add(new Paragraph(formatAmount(invoice.getPerDiemTotal()))));
        }

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void addTotal(Document document, Invoice invoice, PdfFont titleFont) {
        Table table = new Table(2);
        table.setWidth(UnitValue.createPercentValue(50));
        table.setHorizontalAlignment(HorizontalAlignment.RIGHT);

        table.addCell(new Cell().add(new Paragraph("TOTAL GÉNÉRAL:").setFont(titleFont)));
        table.addCell(new Cell().add(new Paragraph(invoice.getTotalAmount() != null ? formatAmount(invoice.getTotalAmount()) + " DT" : "N/A")
                .setFont(titleFont)
                .setFontSize(16)
                .setTextAlignment(TextAlignment.RIGHT)));

        document.add(table);
        document.add(new Paragraph("\n\n"));
    }

    private void addFooter(Document document, PdfFont normalFont) {
        Paragraph footer = new Paragraph("Cette facture a été générée automatiquement le " +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm")))
                .setFont(normalFont)
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(50);
        document.add(footer);
    }

    private void addTableRow(Table table, String label, String value, PdfFont font) {
        table.addCell(new Cell().add(new Paragraph(label).setFont(font)));
        table.addCell(new Cell().add(new Paragraph(value != null ? value : "N/A").setFont(font)));
    }

    private String formatAmount(BigDecimal amount) {
        return String.format("%.2f", amount);
    }
}

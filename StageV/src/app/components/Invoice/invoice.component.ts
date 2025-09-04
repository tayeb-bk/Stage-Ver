import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Invoice } from '../../services/models/invoice';
import { InvoiceControllerService } from '../../services/services/invoice-controller.service';
import { ValidationTravelControllerService } from '../../services/services/validation-travel-controller.service';
import { TravelRequest } from '../../services/models/travel-request';
import { HttpErrorResponse } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import { KeycloakS } from '../../utils/keycloakService/keycloak-s';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {

  invoices: Invoice[] = [];
  approvedTravels: TravelRequest[] = [];
  selectedTravelId: number | null = null;
  newInvoice: Invoice = {};

  successMessage = '';
  errorMessage = '';

  constructor(
    private invoiceService: InvoiceControllerService,
    private travelService: ValidationTravelControllerService,
    public keycloakService: KeycloakS   // ✅ ajouter le service Keycloak

  ) {}

  ngOnInit(): void {
    this.loadApprovedTravels();
    this.loadInvoices();
  }

  loadApprovedTravels(): void {
    this.travelService.getByStatus1({ status: 'APPROVED' }).subscribe({
      next: (resp) => {
        if (resp instanceof Blob) {
          resp.text().then(text => this.approvedTravels = JSON.parse(text));
        } else {
          this.approvedTravels = resp as TravelRequest[];
        }
      },
      error: () => this.errorMessage = 'Erreur lors du chargement des voyages approuvés'
    });
  }
  canValidate(): boolean {
    return this.keycloakService.isOfficer();  // ✅ seuls les OFFICER peuvent effectuer certaines actions
  }

  loadInvoices(): void {
    this.invoiceService.getAllInvoices().subscribe({
      next: (resp) => {
        if (resp instanceof Blob) {
          resp.text().then(text => {
            try {
              this.invoices = JSON.parse(text) as Invoice[];
            } catch {
              this.invoices = [];
            }
          });
        } else {
          this.invoices = resp as Invoice[];
        }
      },
      error: () => this.errorMessage = 'Erreur lors du chargement des factures'
    });
  }


  generateInvoice(): void {
    if (!this.selectedTravelId) {
      this.errorMessage = 'Sélectionnez un voyage approuvé';
      return;
    }

    this.invoiceService.generateInvoice({
      travelRequestId: this.selectedTravelId,
      body: this.newInvoice
    }).subscribe({
      next: (invoice) => {
        this.successMessage = 'Facture générée avec succès ✅';
        this.invoices.push(invoice);
        this.newInvoice = {};
        this.selectedTravelId = null;
        this.clearMessages();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la génération';
      }
    });
  }

  deleteInvoice(id: number): void {
    if (confirm('Voulez-vous supprimer cette facture ?')) {
      this.invoiceService.deleteInvoice({ id }).subscribe({
        next: () => {
          this.invoices = this.invoices.filter(i => i.id !== id);
          this.successMessage = 'Facture supprimée';
          this.clearMessages();
        },
        error: () => this.errorMessage = 'Erreur lors de la suppression'
      });
    }
  }
  downloadInvoiceFront(invoice: Invoice): void {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('FACTURE DE VOYAGE', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Facture N°: ${invoice.id}`, 150, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 50);

    doc.text('INFORMATIONS DU VOYAGE', 20, 70);
    doc.text(`Destination principale: ${invoice.travelRequest?.destination || 'N/A'}`, 20, 80);
    doc.text(`Destination secondaire: ${invoice.travelRequest?.secondaryDestination || 'N/A'}`, 20, 90);
    doc.text(`Objectif: ${invoice.travelRequest?.objective || 'N/A'}`, 20, 100);
    doc.text(`Type: ${invoice.travelRequest?.type || 'N/A'}`, 20, 110);
    doc.text(`Durée: ${invoice.travelRequest?.duration || 0} jours`, 20, 120);
    doc.text(`Visa requis: ${invoice.travelRequest?.visaRequired ? 'Oui' : 'Non'}`, 20, 130);

    doc.text('INFORMATIONS DU VOYAGEUR', 20, 150);
    doc.text(`Nom: ${invoice.travelerFirstName || ''} ${invoice.travelerLastName || ''}`, 20, 160);
    doc.text(`Email: ${invoice.travelerEmail || 'N/A'}`, 20, 170);

    doc.text('DÉTAIL DES COÛTS', 20, 190);
    if(invoice.ticketAmount) doc.text(`Billet: ${invoice.ticketAmount} DT (#${invoice.ticketNumber || 'N/A'})`, 20, 200);
    if(invoice.hotelTotal) doc.text(`Hôtel: ${invoice.hotelTotal} DT (${invoice.nights || 0} nuits)`, 20, 210);
    if(invoice.perDiemTotal) doc.text(`Per Diem: ${invoice.perDiemTotal} DT (${invoice.travelDays || 0} jours)`, 20, 220);

    doc.text(`TOTAL: ${invoice.totalAmount || 0} DT`, 20, 240);

    doc.save(`invoice-${invoice.id}.pdf`);
  }
  clearMessages(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
}

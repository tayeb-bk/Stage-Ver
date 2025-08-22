import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VisaRequestControllerService } from '../../services/services/visa-request-controller.service';
import { PassportControllerService } from '../../services/services/passport-controller.service';
import { VisaRequest } from '../../services/models/visa-request';
import { Passport } from '../../services/models/passport';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-visa-request',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './visa-request.component.html',
  styleUrls: ['./visa-request.component.css']
})
export class VisaRequestComponent implements OnInit {
  // === Partie Passport ===
  passports: Passport[] = [];      // liste des passeports disponibles
  passportId: number | null = null; // ID sélectionné par l'utilisateur

  // === Partie VisaRequest ===
  newVisaRequest: VisaRequest = {};
  successMessage: string | null = null;
  errorMessage: string | null = null;
  fieldErrors: { [key: string]: string } = {};

  // Options
  travelerTypes = ['MEMBER', 'MISSION', 'FORMATION', 'PERSONNEL', 'URGENCE'];
  countries = ['France', 'Allemagne', 'Italie', 'Espagne', 'États-Unis', 'Canada', 'Royaume-Uni'];

  constructor(
    private visaRequestService: VisaRequestControllerService,
    private passportService: PassportControllerService,
    private router: Router // ✅ Injection du Router pour la navigation
  ) {
    this.initializeNewVisaRequest();
  }

  ngOnInit(): void {
    this.loadAllPassports(); // ✅ charger la liste des passeports au démarrage
  }

  initializeNewVisaRequest(): void {
    this.newVisaRequest = {
      missionPurpose: 'Mission de test',
      dateOfMission: '2025-08-21',
      countryOfFirstMission: 'France',
      countryIssuingVisa: 'France',
      travelerType: 'MEMBER',
      passportNumber: '123456',
      issueDate: '2025-08-21',
      expiryDate: '2030-08-21',
      issuingCountry: 'France',
      issuedBy: 'Préfecture',
      status: 'PENDING'
    };
  }

  // === Charger la liste des passeports ===
  loadAllPassports(): void {
    this.passportService.getAll().subscribe({
      next: (data: Blob | Passport[]) => {
        if (data instanceof Blob) {
          data.text().then(text => {
            this.passports = JSON.parse(text) as Passport[];
          });
        } else {
          this.passports = data;
        }

        // Si aucun passeport sélectionné par défaut, prendre le premier dispo
        if (this.passports.length > 0 && !this.passportId) {
          this.passportId = this.passports[0].id!;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des passeports:', err);
      }
    });
  }

  // === Créer une demande ===
  createVisaRequest(): void {
    if (!this.passportId) {
      this.errorMessage = 'Veuillez sélectionner un passeport';
      return;
    }

    if (!this.validateForm()) return;

    this.newVisaRequest.status = 'PENDING';

    this.visaRequestService.createVisaRequest({
      passportId: this.passportId,
      body: this.newVisaRequest
    }).subscribe({
      next: (createdRequest) => {
        this.successMessage = 'Demande de visa créée avec succès';
        this.initializeNewVisaRequest();
        this.clearMessages();

        // Optionnel: rediriger automatiquement après création
        // setTimeout(() => this.goBackToList(), 2000);
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error, 'Erreur lors de la création de la demande de visa');
      }
    });
  }

  // === Navigation vers la liste ===
  goBackToList(): void {
    this.router.navigate(['/visa-liste']); // ✅ Ajustez la route selon votre routing
  }

  // === Validation du formulaire ===
  validateForm(): boolean {
    this.fieldErrors = {};
    let isValid = true;

    if (!this.newVisaRequest.missionPurpose?.trim()) {
      this.fieldErrors['missionPurpose'] = 'Objet obligatoire';
      isValid = false;
    }
    if (!this.newVisaRequest.dateOfMission) {
      this.fieldErrors['dateOfMission'] = 'Date obligatoire';
      isValid = false;
    }
    if (!this.newVisaRequest.travelerType?.trim()) {
      this.fieldErrors['travelerType'] = 'Type obligatoire';
      isValid = false;
    }
    if (!this.newVisaRequest.passportNumber?.trim()) {
      this.fieldErrors['passportNumber'] = 'Numéro passeport obligatoire';
      isValid = false;
    }
    if (!this.newVisaRequest.issueDate) {
      this.fieldErrors['issueDate'] = 'Date de délivrance obligatoire';
      isValid = false;
    }
    if (!this.newVisaRequest.expiryDate) {
      this.fieldErrors['expiryDate'] = 'Date expiration obligatoire';
      isValid = false;
    }
    if (!this.newVisaRequest.issuingCountry?.trim()) {
      this.fieldErrors['issuingCountry'] = 'Pays obligatoire';
      isValid = false;
    }
    if (!this.newVisaRequest.issuedBy?.trim()) {
      this.fieldErrors['issuedBy'] = 'Autorité obligatoire';
      isValid = false;
    }
    return isValid;
  }

  // === Gestion des erreurs ===
  private handleError(error: HttpErrorResponse, defaultMessage: string): void {
    switch (error.status) {
      case 400: this.errorMessage = 'Requête invalide'; break;
      case 401: this.errorMessage = 'Non authentifié'; break;
      case 403: this.errorMessage = 'Accès refusé'; break;
      case 404: this.errorMessage = 'Non trouvé'; break;
      case 500: this.errorMessage = 'Erreur serveur'; break;
      default: this.errorMessage = defaultMessage;
    }
    this.clearMessages();
  }

  // === Utilitaires ===
  private clearMessages(): void {
    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 4000);
  }
  // === Méthode pour les labels des types ===
  getTypeLabel(type: string): string {
    switch (type) {
      case 'MEMBER': return '👥 Membre';
      case 'MISSION': return '🎯 Mission';
      case 'FORMATION': return '📚 Formation';
      case 'PERSONNEL': return '👤 Personnel';
      case 'URGENCE': return '🚨 Urgence';
      default: return type;
    }
  }

  // === Debug method ===
  debugForm(): void {
    console.log('=== DEBUG FORM ===');
    console.log('passportId:', this.passportId);
    console.log('newVisaRequest:', this.newVisaRequest);
    console.log('Validation result:', this.validateForm());
    console.log('==================');
  }
}

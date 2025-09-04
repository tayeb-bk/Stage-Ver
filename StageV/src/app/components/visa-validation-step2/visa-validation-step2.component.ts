import { Component, OnInit } from '@angular/core';
import { ValidationVisaControllerService } from '../../services/services/validation-visa-controller.service';
import { VisaRequest } from '../../services/models/visa-request';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { KeycloakS } from '../../utils/keycloakService/keycloak-s';
@Component({
  selector: 'app-visa-validation-step2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visa-validation-step2.component.html',
  styleUrls: ['./visa-validation-step2.component.css']
})
export class VisaValidationStep2Component implements OnInit {

  visaRequests: VisaRequest[] = [];
  filteredVisaRequests: VisaRequest[] = [];
  allVisaRequests: VisaRequest[] = [];

  // Filtres
  filters = {
    status: 'STEP1_APPROVED', // Par défaut, afficher celles prêtes pour Step 2
    missionPurpose: '',
    countryOfFirstMission: '',
    countryIssuingVisa: '',
    travelerType: '',
    dateFrom: '',
    dateTo: '',
    passportNumber: '',
    issuingCountry: ''
  };

  // Options pour les dropdowns
  uniqueCountriesFirstMission: string[] = [];
  uniqueCountriesIssuingVisa: string[] = [];
  uniqueIssuingCountries: string[] = [];
  uniqueTravelerTypes: string[] = [];
  uniqueMissionPurposes: string[] = [];

  // UI State
  loading = false;
  error: string | null = null;
  showAdvancedFilters = false;
  selectedVisaForReview: VisaRequest | null = null;

  constructor(private visaService: ValidationVisaControllerService,
              public keycloakService: KeycloakS
  ) {}

  ngOnInit(): void {
    this.loadAllVisas();
  }

  loadAllVisas() {
    this.loading = true;
    this.error = null;

    // Charger toutes les demandes de visa de tous les statuts
    const statusesToLoad = ['STEP1_APPROVED', 'APPROVED', 'REJECTED'];
    const loadPromises = statusesToLoad.map(status => this.loadVisasByStatus(status));

    Promise.all(loadPromises)
      .then(results => {
        // Combiner tous les résultats
        this.allVisaRequests = results.flat();
        this.extractUniqueValues();
        this.applyFilters();
        this.loading = false;
      })
      .catch(err => {
        console.error('Erreur lors du chargement:', err);
        this.error = 'Erreur lors du chargement des demandes de visa';
        this.loading = false;
      });
  }

  private loadVisasByStatus(status: string): Promise<VisaRequest[]> {
    return new Promise((resolve, reject) => {
      this.visaService.getByStatus({ status }).subscribe({
        next: (response) => {
          if (response instanceof Blob) {
            response.text().then(text => {
              try {
                const visas = JSON.parse(text) as VisaRequest[];
                resolve(visas || []);
              } catch (parseError) {
                console.error('Erreur de parsing JSON:', parseError);
                resolve([]);
              }
            }).catch(() => resolve([]));
          } else {
            resolve((response as VisaRequest[]) || []);
          }
        },
        error: () => resolve([]) // En cas d'erreur, retourner un tableau vide
      });
    });
  }

  extractUniqueValues() {
    const visas = this.allVisaRequests;

    this.uniqueCountriesFirstMission = [...new Set(
      visas
        .map(v => v.countryOfFirstMission)
        .filter((c): c is string => Boolean(c && c.trim()))
    )].sort();

    this.uniqueCountriesIssuingVisa = [...new Set(
      visas
        .map(v => v.countryIssuingVisa)
        .filter((c): c is string => Boolean(c && c.trim()))
    )].sort();

    this.uniqueIssuingCountries = [...new Set(
      visas
        .map(v => v.issuingCountry)
        .filter((c): c is string => Boolean(c && c.trim()))
    )].sort();

    this.uniqueTravelerTypes = [...new Set(
      visas
        .map(v => v.travelerType)
        .filter((t): t is string => Boolean(t && t.trim()))
    )].sort();

    this.uniqueMissionPurposes = [...new Set(
      visas
        .map(v => v.missionPurpose)
        .filter((m): m is string => Boolean(m && m.trim()))
    )].sort();
  }

  applyFilters() {
    let filtered = [...this.allVisaRequests];

    // Filtrer par statut
    if (this.filters.status) {
      filtered = filtered.filter(v => v.status?.toLowerCase() === this.filters.status.toLowerCase());
    }

    // Filtrer par objectif de mission
    if (this.filters.missionPurpose) {
      filtered = filtered.filter(v =>
        v.missionPurpose?.toLowerCase().includes(this.filters.missionPurpose.toLowerCase())
      );
    }

    // Filtrer par pays de première mission
    if (this.filters.countryOfFirstMission) {
      filtered = filtered.filter(v => v.countryOfFirstMission === this.filters.countryOfFirstMission);
    }

    // Filtrer par pays émetteur du visa
    if (this.filters.countryIssuingVisa) {
      filtered = filtered.filter(v => v.countryIssuingVisa === this.filters.countryIssuingVisa);
    }

    // Filtrer par type de voyageur
    if (this.filters.travelerType) {
      filtered = filtered.filter(v => v.travelerType === this.filters.travelerType);
    }

    // Filtrer par numéro de passeport
    if (this.filters.passportNumber) {
      filtered = filtered.filter(v =>
        v.passportNumber?.toLowerCase().includes(this.filters.passportNumber.toLowerCase())
      );
    }

    // Filtrer par pays d'émission du passeport
    if (this.filters.issuingCountry) {
      filtered = filtered.filter(v => v.issuingCountry === this.filters.issuingCountry);
    }

    // Filtrer par dates
    if (this.filters.dateFrom) {
      const fromDate = new Date(this.filters.dateFrom);
      filtered = filtered.filter(v => {
        if (!v.dateOfMission) return false;
        const missionDate = new Date(v.dateOfMission);
        return missionDate >= fromDate;
      });
    }

    if (this.filters.dateTo) {
      const toDate = new Date(this.filters.dateTo);
      filtered = filtered.filter(v => {
        if (!v.dateOfMission) return false;
        const missionDate = new Date(v.dateOfMission);
        return missionDate <= toDate;
      });
    }

    this.filteredVisaRequests = filtered;
    this.visaRequests = filtered;
  }

  onFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.filters = {
      status: 'STEP1_APPROVED',
      missionPurpose: '',
      countryOfFirstMission: '',
      countryIssuingVisa: '',
      travelerType: '',
      dateFrom: '',
      dateTo: '',
      passportNumber: '',
      issuingCountry: ''
    };
    this.applyFilters();
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  getFilteredCount(): number {
    return this.filteredVisaRequests.length;
  }

  getTotalCount(): number {
    return this.allVisaRequests.length;
  }

  openReviewModal(visa: VisaRequest) {
    this.selectedVisaForReview = visa;
  }

  closeReviewModal() {
    this.selectedVisaForReview = null;
  }
  canValidateStep2(): boolean {
    return this.keycloakService.isHeadMarket();
  }
  validateStep2(visaId: number | undefined, approved: boolean) {
    if (!this.canValidateStep2()) {   // ✅ sécurité côté front
      this.error = "Action interdite : seul un HEAD_MARKET peut valider étape 2";
      return;
    }

    if (!visaId) {
      console.error('ID du visa non défini');
      return;
    }

    this.loading = true;
    this.error = null;

    this.visaService.validateStep2({ id: visaId, approved }).subscribe({
      next: (response) => {
        // Si la réponse est un Blob, on doit la convertir en JSON
        if (response instanceof Blob) {
          response.text().then(text => {
            try {
              const updatedVisa = JSON.parse(text) as VisaRequest;

              // Mettre à jour la liste locale
              const index = this.visaRequests.findIndex(v => v.id === visaId);
              if (index !== -1) {
                this.visaRequests[index] = updatedVisa;
              }

              // Recharger toutes les données pour avoir la vue la plus récente
              this.loadAllVisas();

              // Fermer la modal si elle était ouverte
              this.closeReviewModal();

              this.loading = false;
              console.log('Validation Step 2 réussie:', updatedVisa);
            } catch (parseError) {
              console.error('Erreur de parsing JSON:', parseError);
              this.error = 'Erreur lors du parsing de la réponse';
              this.loading = false;
            }
          }).catch(err => {
            console.error('Erreur lors de la lecture du Blob:', err);
            this.error = 'Erreur lors de la lecture de la réponse';
            this.loading = false;
          });
        } else {
          // Si c'est déjà un objet VisaRequest, on l'utilise directement
          const updatedVisa = response as VisaRequest;

          // Mettre à jour la liste locale
          const index = this.visaRequests.findIndex(v => v.id === visaId);
          if (index !== -1) {
            this.visaRequests[index] = updatedVisa;
          }

          // Recharger toutes les données pour avoir la vue la plus récente
          this.loadAllVisas();

          // Fermer la modal si elle était ouverte
          this.closeReviewModal();

          this.loading = false;
          console.log('Validation Step 2 réussie:', updatedVisa);
        }
      },
      error: (err) => {
        console.error('Erreur lors de la validation:', err);
        this.error = 'Erreur lors de la validation de la demande';
        this.loading = false;
      }
    });
  }

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'STEP1_APPROVED': return 'Étape 1 approuvée';
      case 'STEP1_REJECTED': return 'Étape 1 rejetée';
      case 'APPROVED': return 'Approuvée définitivement';
      case 'REJECTED': return 'Rejetée définitivement';
      default: return status || 'Inconnu';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'STEP1_APPROVED': return 'status-step1-approved';
      case 'STEP1_REJECTED': return 'status-step1-rejected';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-unknown';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Non spécifiée';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getPriorityClass(visa: VisaRequest): string {
    if (!visa.dateOfMission) return '';

    const missionDate = new Date(visa.dateOfMission);
    const today = new Date();
    const daysDiff = Math.ceil((missionDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysDiff <= 7) return 'priority-urgent';
    if (daysDiff <= 30) return 'priority-high';
    return 'priority-normal';
  }

  getPriorityText(visa: VisaRequest): string {
    if (!visa.dateOfMission) return '';

    const missionDate = new Date(visa.dateOfMission);
    const today = new Date();
    const daysDiff = Math.ceil((missionDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysDiff <= 0) return 'Mission commencée';
    if (daysDiff <= 7) return `Urgent - ${daysDiff} jour(s)`;
    if (daysDiff <= 30) return `Priorité haute - ${daysDiff} jours`;
    return `${daysDiff} jours restants`;
  }
}

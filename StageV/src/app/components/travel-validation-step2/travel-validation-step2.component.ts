import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TravelRequest } from '../../services/models/travel-request';
import { ValidationTravelControllerService } from '../../services/services/validation-travel-controller.service';
import { KeycloakS } from '../../utils/keycloakService/keycloak-s';

@Component({
  selector: 'app-travel-validation-step2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './travel-validation-step2.component.html',
  styleUrls: ['./travel-validation-step2.component.css']
})
export class TravelValidationStep2Component implements OnInit {
  travels: TravelRequest[] = [];
  filteredTravels: TravelRequest[] = [];
  allTravels: TravelRequest[] = [];

  filters = {
    status: 'STEP1_APPROVED',
    objective: '',
    destination: '',
    dateFrom: '',
    dateTo: ''
  };

  uniqueDestinations: string[] = [];
  uniquePurposes: string[] = [];

  loading = false;
  error: string | null = null;
  showAdvancedFilters = false;
  selectedTravelForReview: TravelRequest | null = null;

  constructor(
    private travelService: ValidationTravelControllerService,
    public keycloakService: KeycloakS
  ) {}

  ngOnInit(): void {
    this.loadAllTravels();
  }

  loadAllTravels() {
    this.loading = true;
    this.error = null;

    const statuses = ['STEP1_APPROVED', 'APPROVED', 'REJECTED'];
    const promises = statuses.map(status => this.loadByStatus(status));

    Promise.all(promises)
      .then(results => {
        this.allTravels = results.flat();
        this.extractUniqueValues();
        this.applyFilters();
        this.loading = false;
      })
      .catch(err => {
        console.error(err);
        this.error = 'Erreur lors du chargement des voyages';
        this.loading = false;
      });
  }

  private loadByStatus(status: string): Promise<TravelRequest[]> {
    return new Promise((resolve) => {
      this.travelService.getByStatus1({ status }).subscribe({
        next: (resp) => {
          if (resp instanceof Blob) {
            resp.text().then(text => {
              try {
                resolve(JSON.parse(text) as TravelRequest[]);
              } catch {
                resolve([]);
              }
            });
          } else {
            resolve(resp as TravelRequest[]);
          }
        },
        error: () => resolve([])
      });
    });
  }

  extractUniqueValues() {
    const travels = this.allTravels;

    this.uniqueDestinations = [...new Set(
      travels.map(t => t.destination).filter((d): d is string => !!d)
    )].sort();

    this.uniquePurposes = [...new Set(
      travels.map(t => t.objective).filter((p): p is string => !!p)
    )].sort();
  }

  applyFilters() {
    let filtered = [...this.allTravels];

    if (this.filters.status) {
      filtered = filtered.filter(t => t.status?.toLowerCase() === this.filters.status.toLowerCase());
    }

    if (this.filters.objective) {
      filtered = filtered.filter(t => t.objective?.toLowerCase().includes(this.filters.objective.toLowerCase()));
    }

    if (this.filters.destination) {
      filtered = filtered.filter(t => t.destination === this.filters.destination);
    }

    if (this.filters.dateFrom) {
      const from = new Date(this.filters.dateFrom);
      filtered = filtered.filter(t => t.departureDate && new Date(t.departureDate) >= from);
    }

    if (this.filters.dateTo) {
      const to = new Date(this.filters.dateTo);
      filtered = filtered.filter(t => t.returnDate && new Date(t.returnDate) <= to);
    }

    this.filteredTravels = filtered;
    this.travels = filtered;
  }

  clearFilters() {
    this.filters = {
      status: 'STEP1_APPROVED',
      objective: '',
      destination: '',
      dateFrom: '',
      dateTo: ''
    };
    this.applyFilters();
  }

  canValidateStep2(): boolean {
    return this.keycloakService.isHeadMarket();
  }

  validateStep2(id: number | undefined, approved: boolean) {
    if (!this.canValidateStep2()) {
      this.error = 'Action interdite : seul un HEAD_MARKET peut valider étape 2';
      return;
    }
    if (!id) return;

    this.loading = true;
    this.travelService.validateStep21({ id, approved }).subscribe({
      next: (resp) => {
        if (resp instanceof Blob) {
          resp.text().then(text => {
            try {
              const updated = JSON.parse(text) as TravelRequest;
              this.updateLocalList(id, updated);
            } catch {
              this.error = 'Erreur parsing Travel';
            }
            this.loading = false;
          });
        } else {
          const updated = resp as TravelRequest;
          this.updateLocalList(id, updated);
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Erreur lors de la validation';
        this.loading = false;
      }
    });
  }

  updateLocalList(id: number, updated: TravelRequest) {
    const index = this.travels.findIndex(t => t.id === id);
    if (index !== -1) this.travels[index] = updated;
    this.loadAllTravels();
    this.selectedTravelForReview = null;
  }
  // Ajoutez ces méthodes à votre TravelValidationStep2Component

// Méthodes pour les statistiques
  getFilteredCount(): number {
    return this.filteredTravels.length;
  }

  getTotalCount(): number {
    return this.allTravels.length;
  }

// Méthode pour toggler les filtres avancés
  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

// Méthodes pour la modal de révision
  openReviewModal(travel: TravelRequest) {
    this.selectedTravelForReview = travel;
  }

  closeReviewModal() {
    this.selectedTravelForReview = null;
  }

// Méthodes pour le statut
  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'STEP1_APPROVED': return 'Étape 1 approuvée';
      case 'STEP1_REJECTED': return 'Étape 1 rejetée';
      case 'APPROVED': return 'Approuvé définitivement';
      case 'REJECTED': return 'Rejeté définitivement';
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

// Méthodes pour la priorité basée sur les dates
  getPriorityClass(travel: TravelRequest): string {
    if (!travel.departureDate) return '';

    const departureDate = new Date(travel.departureDate);
    const today = new Date();
    const daysDiff = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysDiff <= 7) return 'priority-urgent';
    if (daysDiff <= 30) return 'priority-high';
    return 'priority-normal';
  }

  getPriorityText(travel: TravelRequest): string {
    if (!travel.departureDate) return '';

    const departureDate = new Date(travel.departureDate);
    const today = new Date();
    const daysDiff = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysDiff <= 0) return 'Voyage commencé';
    if (daysDiff <= 7) return `Urgent - ${daysDiff} jour(s)`;
    if (daysDiff <= 30) return `Priorité haute - ${daysDiff} jours`;
    return `${daysDiff} jours restants`;
  }
}

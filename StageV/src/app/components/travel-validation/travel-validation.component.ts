import { Component, OnInit } from '@angular/core';
import { ValidationTravelControllerService } from '../../services/services/validation-travel-controller.service';
import { TravelRequest } from '../../services/models/travel-request';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { KeycloakS } from '../../utils/keycloakService/keycloak-s';

@Component({
  selector: 'app-travel-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './travel-validation.component.html',
  styleUrls: ['./travel-validation.component.css']
})
export class TravelValidationComponent implements OnInit {

  travelRequests: TravelRequest[] = [];
  filteredTravelRequests: TravelRequest[] = [];
  allTravelRequests: TravelRequest[] = [];

  // Filtres
  filters = {
    status: 'PENDING',
    objective: '',
    destination: '',
    secondaryDestination: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    durationMin: null as number | null,
    durationMax: null as number | null
  };

  // Options pour les dropdowns
  uniqueDestinations: string[] = [];
  uniqueSecondaryDestinations: string[] = [];
  uniqueTypes: string[] = [];

  // UI State
  loading = false;
  error: string | null = null;
  showAdvancedFilters = false;

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

    // Charger toutes les demandes de voyage de tous les statuts
    const statusesToLoad = ['PENDING', 'STEP1_APPROVED', 'STEP1_REJECTED', 'APPROVED', 'REJECTED'];
    const loadPromises = statusesToLoad.map(status => this.loadTravelsByStatus(status));

    Promise.all(loadPromises)
      .then(results => {
        // Combiner tous les résultats
        this.allTravelRequests = results.flat();
        this.extractUniqueValues();
        this.applyFilters();
        this.loading = false;
      })
      .catch(err => {
        console.error('Erreur lors du chargement:', err);
        this.error = 'Erreur lors du chargement des demandes de voyage';
        this.loading = false;
      });
  }

  private loadTravelsByStatus(status: string): Promise<TravelRequest[]> {
    return new Promise((resolve, reject) => {
      this.travelService.getByStatus1({ status }).subscribe({
        next: (response) => {
          if (response instanceof Blob) {
            response.text().then(text => {
              try {
                const travels = JSON.parse(text) as TravelRequest[];
                resolve(travels || []);
              } catch (parseError) {
                console.error('Erreur de parsing JSON:', parseError);
                resolve([]);
              }
            }).catch(() => resolve([]));
          } else {
            resolve((response as TravelRequest[]) || []);
          }
        },
        error: () => resolve([]) // En cas d'erreur, retourner un tableau vide
      });
    });
  }

  extractUniqueValues() {
    const travels = this.allTravelRequests;

    this.uniqueDestinations = [...new Set(
      travels
        .map(t => t.destination)
        .filter((d): d is string => Boolean(d && d.trim()))
    )].sort();

    this.uniqueSecondaryDestinations = [...new Set(
      travels
        .map(t => t.secondaryDestination)
        .filter((d): d is string => Boolean(d && d.trim()))
    )].sort();

    this.uniqueTypes = [...new Set(
      travels
        .map(t => t.type)
        .filter((t): t is string => Boolean(t && t.trim()))
    )].sort();
  }

  applyFilters() {
    let filtered = [...this.allTravelRequests];

    // Filtrer par statut
    if (this.filters.status) {
      filtered = filtered.filter(t => t.status?.toLowerCase() === this.filters.status.toLowerCase());
    }

    // Filtrer par objectif
    if (this.filters.objective) {
      filtered = filtered.filter(t =>
        t.objective?.toLowerCase().includes(this.filters.objective.toLowerCase())
      );
    }

    // Filtrer par destination
    if (this.filters.destination) {
      filtered = filtered.filter(t => t.destination === this.filters.destination);
    }

    // Filtrer par destination secondaire
    if (this.filters.secondaryDestination) {
      filtered = filtered.filter(t => t.secondaryDestination === this.filters.secondaryDestination);
    }

    // Filtrer par type
    if (this.filters.type) {
      filtered = filtered.filter(t => t.type === this.filters.type);
    }

    // Filtrer par dates
    if (this.filters.dateFrom) {
      const fromDate = new Date(this.filters.dateFrom);
      filtered = filtered.filter(t => {
        if (!t.departureDate) return false;
        const departureDate = new Date(t.departureDate);
        return departureDate >= fromDate;
      });
    }

    if (this.filters.dateTo) {
      const toDate = new Date(this.filters.dateTo);
      filtered = filtered.filter(t => {
        if (!t.departureDate) return false;
        const departureDate = new Date(t.departureDate);
        return departureDate <= toDate;
      });
    }

    // Filtrer par durée
    if (this.filters.durationMin !== null && this.filters.durationMin > 0) {
      filtered = filtered.filter(t => (t.duration || 0) >= this.filters.durationMin!);
    }

    if (this.filters.durationMax !== null && this.filters.durationMax > 0) {
      filtered = filtered.filter(t => (t.duration || 0) <= this.filters.durationMax!);
    }

    this.filteredTravelRequests = filtered;
    this.travelRequests = filtered;
  }

  onFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.filters = {
      status: 'PENDING',
      objective: '',
      destination: '',
      secondaryDestination: '',
      type: '',
      dateFrom: '',
      dateTo: '',
      durationMin: null,
      durationMax: null
    };
    this.applyFilters();
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  getFilteredCount(): number {
    return this.filteredTravelRequests.length;
  }

  getTotalCount(): number {
    return this.allTravelRequests.length;
  }

  // Vérification des droits de validation (OFFICER pour étape 1)
  canValidate(): boolean {
    return this.keycloakService.isOfficer();
  }

  validateStep1(travelId: number | undefined, approved: boolean) {
    if (!this.canValidate()) {
      this.error = 'Action interdite : seul un OFFICER peut valider/rejeter un voyage';
      return;
    }

    if (!travelId) return;

    this.loading = true;
    this.error = null;

    this.travelService.validateStep11({ id: travelId, approved }).subscribe({
      next: (response) => {
        if (response instanceof Blob) {
          response.text().then(text => {
            try {
              const updatedTravel = JSON.parse(text) as TravelRequest;
              this.updateTravelList(travelId, updatedTravel);
            } catch {
              this.error = 'Erreur parsing réponse';
            } finally {
              this.loading = false;
            }
          });
        } else {
          const updatedTravel = response as TravelRequest;
          this.updateTravelList(travelId, updatedTravel);
          this.loading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur validation voyage', err);
        this.error = 'Erreur lors de la validation';
        this.loading = false;
      }
    });
  }

  private updateTravelList(travelId: number, updatedTravel: TravelRequest) {
    const index = this.travelRequests.findIndex(t => t.id === travelId);
    if (index !== -1) {
      this.travelRequests[index] = updatedTravel;
    }
    this.loadAllTravels(); // recharge après modification
  }

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'STEP1_APPROVED': return 'Étape 1 approuvée';
      case 'STEP1_REJECTED': return 'Étape 1 rejetée';
      case 'APPROVED': return 'Approuvée';
      case 'REJECTED': return 'Rejetée';
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
}

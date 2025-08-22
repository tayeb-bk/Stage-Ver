import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisaRequestControllerService } from '../../services/services/visa-request-controller.service';
import { VisaRequest } from '../../services/models/visa-request';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-visa-liste',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visa-liste.component.html',
  styleUrls: ['./visa-liste.component.css']
})
export class VisaListeComponent implements OnInit {
  visaRequests: VisaRequest[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Filtres
  statusFilter: string = '';
  countryFilter: string = '';
  travelerTypeFilter: string = '';

  // Options pour les filtres
  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'APPROVED', label: 'Approuvée' },
    { value: 'REJECTED', label: 'Rejetée' }
  ];

  travelerTypeOptions = [
    { value: '', label: 'Tous les types' },
    { value: 'MEMBER', label: 'Membre' },
    { value: 'MISSION', label: 'Mission' },
    { value: 'FORMATION', label: 'Formation' },
    { value: 'PERSONNEL', label: 'Personnel' },
    { value: 'URGENCE', label: 'Urgence' }
  ];

  constructor(
    private visaRequestService: VisaRequestControllerService
  ) {}

  ngOnInit(): void {
    this.loadAllVisaRequests();
  }

  /**
   * Naviguer vers la page de création de visa
   */
  goToCreateVisa(): void {
    // Option 1: Si vous utilisez le router Angular
    // this.router.navigate(['/visa-request']);

    // Option 2: Navigation simple avec window.location
    window.location.href = '/visa-request';

    // Option 3: Si c'est dans la même application, vous pouvez émettre un événement
    // this.navigateToCreate.emit();
  }

  /**
   * Charger toutes les demandes de visa
   */
  loadAllVisaRequests(): void {
    this.loading = true;
    this.errorMessage = null;

    this.visaRequestService.getAllVisaRequests().subscribe({
      next: (requests) => {
        this.visaRequests = requests;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error, 'Erreur lors du chargement des demandes de visa');
        this.loading = false;
      }
    });
  }

  /**
   * Rafraîchir la liste
   */
  refreshList(): void {
    this.loadAllVisaRequests();
  }

  /**
   * Supprimer une demande de visa
   */
  deleteVisaRequest(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande de visa ?')) {
      this.visaRequestService.deleteVisaRequest({ id }).subscribe({
        next: () => {
          this.visaRequests = this.visaRequests.filter(r => r.id !== id);
          this.successMessage = 'Demande de visa supprimée avec succès';
          this.clearMessages();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'Erreur lors de la suppression de la demande');
        }
      });
    }
  }

  /**
   * Obtenir les demandes filtrées
   */
  get filteredVisaRequests(): VisaRequest[] {
    return this.visaRequests.filter(request => {
      const statusMatch = !this.statusFilter || request.status === this.statusFilter;
      const countryMatch = !this.countryFilter ||
        request.countryOfFirstMission?.toLowerCase().includes(this.countryFilter.toLowerCase()) ||
        request.countryIssuingVisa?.toLowerCase().includes(this.countryFilter.toLowerCase());
      const travelerTypeMatch = !this.travelerTypeFilter || request.travelerType === this.travelerTypeFilter;

      return statusMatch && countryMatch && travelerTypeMatch;
    });
  }

  /**
   * Réinitialiser tous les filtres
   */
  clearFilters(): void {
    this.statusFilter = '';
    this.countryFilter = '';
    this.travelerTypeFilter = '';
  }

  /**
   * Obtenir la classe CSS pour le statut
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  }

  /**
   * Obtenir le libellé du statut
   */
  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'APPROVED': return 'Approuvée';
      case 'REJECTED': return 'Rejetée';
      default: return status;
    }
  }

  /**
   * Obtenir le libellé du type de voyageur
   */
  getTravelerTypeLabel(type: string): string {
    switch (type) {
      case 'MEMBER': return 'Membre';
      case 'MISSION': return 'Mission';
      case 'FORMATION': return 'Formation';
      case 'PERSONNEL': return 'Personnel';
      case 'URGENCE': return 'Urgence';
      default: return type;
    }
  }

  /**
   * Formater une date
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  /**
   * Obtenir les pays uniques pour le filtre
   */
  get uniqueCountries(): string[] {
    const countries = new Set<string>();
    this.visaRequests.forEach(request => {
      if (request.countryOfFirstMission) countries.add(request.countryOfFirstMission);
      if (request.countryIssuingVisa) countries.add(request.countryIssuingVisa);
    });
    return Array.from(countries).sort();
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: HttpErrorResponse, defaultMessage: string): void {
    console.error('Erreur HTTP:', error);

    switch (error.status) {
      case 400:
        this.errorMessage = 'Requête invalide. Vérifiez les données envoyées.';
        break;
      case 401:
        this.errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
        break;
      case 403:
        this.errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        break;
      case 404:
        this.errorMessage = 'Ressource non trouvée.';
        break;
      case 500:
        this.errorMessage = 'Erreur serveur interne. Veuillez réessayer plus tard.';
        break;
      default:
        this.errorMessage = defaultMessage;
    }

    this.clearMessages();
  }

  /**
   * Effacer les messages après un délai
   */
  private clearMessages(): void {
    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 4000);
  }

  /**
   * Voir les détails d'une demande (placeholder pour future implémentation)
   */
  viewDetails(request: VisaRequest): void {
    // Vous pouvez implémenter ici la navigation vers une page de détails
    // ou afficher un modal avec les détails complets
    console.log('Voir détails de la demande:', request);
    // Exemple: this.router.navigate(['/visa-details', request.id]);
  }

  /**
   * TrackBy function pour optimiser les performances de *ngFor
   */
  trackByRequestId(index: number, item: VisaRequest): number {
    return item.id || index;
  }

  /**
   * Méthode pour déboguer (utile en développement)
   */
  debugInfo(): void {
    console.log('=== DEBUG VISA LISTE ===');
    console.log('Total requests:', this.visaRequests.length);
    console.log('Filtered requests:', this.filteredVisaRequests.length);
    console.log('Filters:', {
      status: this.statusFilter,
      country: this.countryFilter,
      travelerType: this.travelerTypeFilter
    });
    console.log('Unique countries:', this.uniqueCountries);
    console.log('========================');
  }
}

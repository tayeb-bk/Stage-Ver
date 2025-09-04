import { Component, OnInit } from '@angular/core';
import { MissionControllerService } from '../../services/services/mission-controller.service';
import { Mission } from '../../services/models/mission';
import { ProjectControllerService } from '../../services/services/project-controller.service';
import { Project } from '../../services/models/project';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { KeycloakS } from '../../utils/keycloakService/keycloak-s';

@Component({
  selector: 'app-mission',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.css']
})
export class MissionComponent implements OnInit {
  missions: Mission[] = [];
  projects: Project[] = [];
  newMission: Mission = { name: '', description: '', startDate: '', endDate: '', project: undefined };
  isEditing: boolean = false;
  editingId: number | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Filtres
  nameFilter: string = '';
  descriptionFilter: string = '';
  projectFilter: string = '';
  statusFilter: string = '';
  dateRangeFilter: string = '';

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminé' },
    { value: 'A_VENIR', label: 'À venir' },
    { value: 'SUSPENDU', label: 'Suspendu' }
  ];

  dateRangeOptions = [
    { value: '', label: 'Toutes les dates' },
    { value: 'CETTE_SEMAINE', label: 'Cette semaine' },
    { value: 'CE_MOIS', label: 'Ce mois' },
    { value: 'MOIS_PROCHAIN', label: 'Mois prochain' },
    { value: 'TRIMESTRE', label: 'Ce trimestre' }
  ];

  constructor(
    private missionService: MissionControllerService,
    private projectService: ProjectControllerService,
    public keycloakService: KeycloakS
  ) {}

  ngOnInit(): void {
    this.loadMissions();
    this.loadProjects();
  }

  // Charger toutes les missions
  loadMissions(): void {
    this.loading = true;
    this.errorMessage = null;

    this.missionService.getAllMissions().subscribe({
      next: (data) => {
        this.missions = data;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error, 'Erreur lors du chargement des missions');
        this.loading = false;
      }
    });
  }

  // Charger tous les projets
  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (data) => this.projects = data,
      error: (err) => console.error('Erreur chargement projets :', err)
    });
  }

  refreshList(): void {
    this.loadMissions();
    this.loadProjects();
  }

  // Créer ou mettre à jour une mission
  saveMission(): void {
    if (!this.keycloakService.isOfficer()) {
      this.errorMessage = 'Action interdite : seul un OFFICER peut créer ou modifier une mission';
      return;
    }

    if (this.isEditing && this.editingId !== null) {
      this.missionService.updateMission({ id: this.editingId, body: this.newMission }).subscribe({
        next: () => {
          this.successMessage = 'Mission mise à jour avec succès';
          this.onSuccess();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'Erreur lors de la mise à jour de la mission');
        }
      });
    } else {
      this.missionService.createMission({ body: this.newMission }).subscribe({
        next: () => {
          this.successMessage = 'Mission créée avec succès';
          this.onSuccess();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'Erreur lors de la création de la mission');
        }
      });
    }
  }

  editMission(mission: Mission): void {
    if (!this.keycloakService.isOfficer()) {
      this.errorMessage = 'Action interdite : seul un OFFICER peut modifier une mission';
      return;
    }

    this.isEditing = true;
    this.editingId = mission.id ?? null;
    this.newMission = { ...mission };
  }

  deleteMission(id: number): void {
    if (!this.keycloakService.isOfficer()) {
      this.errorMessage = 'Action interdite : seul un OFFICER peut supprimer une mission';
      return;
    }

    if (confirm('Voulez-vous vraiment supprimer cette mission ?')) {
      this.missionService.deleteMission({ id }).subscribe({
        next: () => {
          this.successMessage = 'Mission supprimée avec succès';
          this.loadMissions();
          this.clearMessages();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'Erreur lors de la suppression de la mission');
        }
      });
    }
  }

  onSuccess(): void {
    this.loadMissions();
    this.newMission = { name: '', description: '', startDate: '', endDate: '', project: undefined };
    this.isEditing = false;
    this.editingId = null;
    this.clearMessages();
  }

  get filteredMissions(): Mission[] {
    return this.missions.filter(mission => {
      const nameMatch = !this.nameFilter || mission.name?.toLowerCase().includes(this.nameFilter.toLowerCase());
      const descriptionMatch = !this.descriptionFilter || mission.description?.toLowerCase().includes(this.descriptionFilter.toLowerCase());
      const projectMatch = !this.projectFilter || mission.project?.name?.toLowerCase().includes(this.projectFilter.toLowerCase());
      const statusMatch = !this.statusFilter || this.getMissionStatus(mission) === this.statusFilter;
      const dateRangeMatch = !this.dateRangeFilter || this.isInDateRange(mission, this.dateRangeFilter);
      return nameMatch && descriptionMatch && projectMatch && statusMatch && dateRangeMatch;
    });
  }

  clearFilters(): void {
    this.nameFilter = '';
    this.descriptionFilter = '';
    this.projectFilter = '';
    this.statusFilter = '';
    this.dateRangeFilter = '';
  }

  getMissionStatus(mission: Mission): string {
    if (!mission.startDate || !mission.endDate) return 'NON_DEFINI';
    const today = new Date();
    const startDate = new Date(mission.startDate);
    const endDate = new Date(mission.endDate);

    if (today < startDate) return 'A_VENIR';
    if (today > endDate) return 'TERMINE';
    if (today >= startDate && today <= endDate) return 'EN_COURS';
    return 'NON_DEFINI';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      case 'A_VENIR': return 'À venir';
      case 'SUSPENDU': return 'Suspendu';
      case 'NON_DEFINI': return 'Non défini';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_COURS': return 'status-in-progress';
      case 'TERMINE': return 'status-completed';
      case 'A_VENIR': return 'status-upcoming';
      case 'SUSPENDU': return 'status-suspended';
      case 'NON_DEFINI': return 'status-undefined';
      default: return '';
    }
  }

  isInDateRange(mission: Mission, range: string): boolean {
    if (!mission.startDate) return false;
    const today = new Date();
    const startDate = new Date(mission.startDate);

    switch (range) {
      case 'CETTE_SEMAINE':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return startDate >= weekStart && startDate <= weekEnd;

      case 'CE_MOIS':
        return startDate.getMonth() === today.getMonth() && startDate.getFullYear() === today.getFullYear();

      case 'MOIS_PROCHAIN':
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        return startDate.getMonth() === nextMonth.getMonth() && startDate.getFullYear() === nextMonth.getFullYear();

      case 'TRIMESTRE':
        const quarter = Math.floor(today.getMonth() / 3);
        const missionQuarter = Math.floor(startDate.getMonth() / 3);
        return missionQuarter === quarter && startDate.getFullYear() === today.getFullYear();

      default:
        return true;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  getMissionDuration(mission: Mission): string {
    if (!mission.startDate || !mission.endDate) return 'Non définie';
    const start = new Date(mission.startDate);
    const end = new Date(mission.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 jour';
    if (diffDays < 30) return `${diffDays} jours`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} mois`;
    return `${Math.round(diffDays / 365)} an(s)`;
  }

  get uniqueProjects(): Project[] {
    return this.projects.filter((project, index, self) =>
      index === self.findIndex(p => p.name === project.name)
    );
  }

  canEdit(): boolean {
    return this.keycloakService.isOfficer();
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string): void {
    console.error('Erreur HTTP:', error);
    switch (error.status) {
      case 400: this.errorMessage = 'Requête invalide. Vérifiez les données envoyées.'; break;
      case 401: this.errorMessage = 'Non authentifié. Veuillez vous reconnecter.'; break;
      case 403: this.errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.'; break;
      case 404: this.errorMessage = 'Ressource non trouvée.'; break;
      case 500: this.errorMessage = 'Erreur serveur interne. Veuillez réessayer plus tard.'; break;
      default: this.errorMessage = defaultMessage;
    }
    this.clearMessages();
  }

  private clearMessages(): void {
    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 4000);
  }

  trackByMissionId(index: number, item: Mission): number {
    return item.id || index;
  }

  debugInfo(): void {
    console.log('=== DEBUG MISSION LISTE ===');
    console.log('Total missions:', this.missions.length);
    console.log('Filtered missions:', this.filteredMissions.length);
    console.log('Filters:', {
      name: this.nameFilter,
      description: this.descriptionFilter,
      project: this.projectFilter,
      status: this.statusFilter,
      dateRange: this.dateRangeFilter
    });
    console.log('Unique projects:', this.uniqueProjects.length);
    console.log('============================');
  }
}

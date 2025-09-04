import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TravelRequestControllerService } from '../../services/services/travel-request-controller.service';
import { ProjectControllerService } from '../../services/services/project-controller.service';
import { TravelRequest } from '../../services/models/travel-request';
import { Project } from '../../services/models/project';
import { Mission } from '../../services/models/mission';
import { HttpErrorResponse } from '@angular/common/http';

interface TravelRequestFilters {
  project: string;
  mission: string;
  destination: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

@Component({
  selector: 'app-travel-request',
  standalone: true,
  templateUrl: './travel-request.component.html',
  styleUrls: ['./travel-request.component.css'],
  imports: [FormsModule, CommonModule]
})
export class TravelRequestComponent implements OnInit {

  travelRequests: TravelRequest[] = [];
  filteredTravelRequests: TravelRequest[] = [];
  projects: Project[] = [];
  missions: Mission[] = [];

  newTravelRequest: TravelRequest = {};
  isEditing: boolean = false;

  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  // Filtres
  filters: TravelRequestFilters = {
    project: '',
    mission: '',
    destination: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  };

  constructor(
    private travelService: TravelRequestControllerService,
    private projectService: ProjectControllerService
  ) { }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;

    this.travelService.getAllTravelRequests().subscribe({
      next: (data: TravelRequest[]) => {
        this.travelRequests = data;
        this.filteredTravelRequests = [...data]; // Initialiser la liste filtrée
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = 'Erreur lors du chargement des demandes de voyage.';
        this.loading = false;
      }
    });

    this.projectService.getAllProjects().subscribe({
      next: (data: Project[]) => this.projects = data,
      error: () => this.projects = []
    });
  }

  onProjectChange(project: Project | undefined): void {
    this.newTravelRequest.mission = undefined;
    this.missions = project?.missions || [];
  }

  saveTravelRequest(): void {
    this.newTravelRequest.status = 'Pending';

    if (this.isEditing && this.newTravelRequest.id) {
      this.travelService.updateTravelRequest({ id: this.newTravelRequest.id, body: this.newTravelRequest })
        .subscribe({
          next: () => {
            this.successMessage = 'Demande de voyage mise à jour.';
            this.resetForm();
            this.loadAllData();
            this.clearMessages();
          },
          error: () => this.errorMessage = 'Erreur lors de la mise à jour.'
        });
    } else {
      this.travelService.createTravelRequest$Json({ body: this.newTravelRequest })
        .subscribe({
          next: () => {
            this.successMessage = 'Demande de voyage créée.';
            this.resetForm();
            this.loadAllData();
            this.clearMessages();
          },
          error: () => this.errorMessage = 'Erreur lors de la création.'
        });
    }
  }

  editTravelRequest(tr: TravelRequest): void {
    this.isEditing = true;
    this.newTravelRequest = { ...tr };
    this.onProjectChange(tr.project);
  }

  deleteTravelRequest(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande de voyage ?')) {
      this.travelService.deleteTravelRequest({ id }).subscribe({
        next: () => {
          this.successMessage = 'Demande supprimée.';
          this.loadAllData();
          this.clearMessages();
        },
        error: () => this.errorMessage = 'Erreur lors de la suppression.'
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.newTravelRequest = {};
    this.missions = [];
  }

  // ======== MÉTHODES DE FILTRAGE ========

  applyFilters(): void {
    this.filteredTravelRequests = this.travelRequests.filter(tr => {
      // Filtre par projet
      if (this.filters.project && tr.project?.name !== this.filters.project) {
        return false;
      }

      // Filtre par mission
      if (this.filters.mission && tr.mission?.name !== this.filters.mission) {
        return false;
      }

      // Filtre par destination (recherche insensible à la casse)
      if (this.filters.destination &&
        !tr.destination?.toLowerCase().includes(this.filters.destination.toLowerCase())) {
        return false;
      }

      // Filtre par statut
      if (this.filters.status && tr.status !== this.filters.status) {
        return false;
      }

      // Filtre par date de départ (à partir de)
      if (this.filters.dateFrom && tr.departureDate) {
        const trDate = new Date(tr.departureDate);
        const filterDate = new Date(this.filters.dateFrom);
        if (trDate < filterDate) {
          return false;
        }
      }

      // Filtre par date de départ (jusqu'à)
      if (this.filters.dateTo && tr.departureDate) {
        const trDate = new Date(tr.departureDate);
        const filterDate = new Date(this.filters.dateTo);
        if (trDate > filterDate) {
          return false;
        }
      }

      return true;
    });
  }

  clearFilters(): void {
    this.filters = {
      project: '',
      mission: '',
      destination: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    };
    this.filteredTravelRequests = [...this.travelRequests];
  }

  getAllMissions(): Mission[] {
    const allMissions: Mission[] = [];
    this.projects.forEach(project => {
      if (project.missions) {
        allMissions.push(...project.missions);
      }
    });
    // Éliminer les doublons basés sur le nom
    return allMissions.filter((mission, index, self) =>
      index === self.findIndex(m => m.name === mission.name)
    );
  }

  private clearMessages(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
}

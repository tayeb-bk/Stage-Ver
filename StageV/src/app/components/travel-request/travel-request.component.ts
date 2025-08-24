import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TravelRequestControllerService } from '../../services/services/travel-request-controller.service';
import { ProjectControllerService } from '../../services/services/project-controller.service';
import { TravelRequest } from '../../services/models/travel-request';
import { Project } from '../../services/models/project';
import { Mission } from '../../services/models/mission';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-travel-request',
  standalone: true,
  templateUrl: './travel-request.component.html',
  styleUrls: ['./travel-request.component.css'],
  imports: [FormsModule, CommonModule]
})
export class TravelRequestComponent implements OnInit {

  travelRequests: TravelRequest[] = [];
  projects: Project[] = [];
  missions: Mission[] = [];

  newTravelRequest: TravelRequest = {};
  isEditing: boolean = false;

  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

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

  // Pas besoin de selectedProjectId
  onProjectChange(project: Project | undefined): void {
    this.newTravelRequest.mission = undefined;
    this.missions = project?.missions || [];
  }


  saveTravelRequest(): void {
    // Toujours générer le status "Pending"
    this.newTravelRequest.status = 'Pending';

    if (this.isEditing && this.newTravelRequest.id) {
      this.travelService.updateTravelRequest({ id: this.newTravelRequest.id, body: this.newTravelRequest })
        .subscribe({
          next: () => {
            this.successMessage = 'Demande de voyage mise à jour.';
            this.resetForm();
            this.loadAllData();
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
    this.travelService.deleteTravelRequest({ id }).subscribe({
      next: () => {
        this.successMessage = 'Demande supprimée.';
        this.loadAllData();
      },
      error: () => this.errorMessage = 'Erreur lors de la suppression.'
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.newTravelRequest = {};
    this.missions = [];
  }

}

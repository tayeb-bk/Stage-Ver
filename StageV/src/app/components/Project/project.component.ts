import { Component, OnInit } from '@angular/core';
import { ProjectControllerService } from '../../services/services/project-controller.service';
import { Project } from '../../services/models/project';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  projects: Project[] = [];
  missionsCount: { [key: number]: number } = {};
  newProject: Project = { name: '', code: '', clientname: '' };
  isEditing: boolean = false;
  editingId: number | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Filtres
  nameFilter: string = '';
  codeFilter: string = '';
  clientFilter: string = '';

  constructor(private projectService: ProjectControllerService) {}

  ngOnInit(): void {
    console.log('ProjectComponent chargé');
    this.loadProjects();
    this.loadMissionsCount();
  }

  // Charger tous les projets
  loadProjects(): void {
    this.loading = true;
    this.errorMessage = null;

    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        console.log('Projets reçus :', data);
        this.projects = data;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error, 'Erreur lors du chargement des projets');
        this.loading = false;
      }
    });
  }

  // Rafraîchir la liste
  refreshList(): void {
    this.loadProjects();
    this.loadMissionsCount();
  }

  // Charger le nombre de missions par projet
  loadMissionsCount(): void {
    this.projectService.countMissionsByProject().subscribe({
      next: (data) => {
        this.missionsCount = data;
      },
      error: (err) => {
        console.error('Erreur missions count :', err);
        this.missionsCount = {};
      }
    });
  }

  // Créer ou mettre à jour un projet
  saveProject(): void {
    if (this.isEditing && this.editingId !== null) {
      this.projectService.updateProject({ id: this.editingId, body: this.newProject }).subscribe({
        next: () => {
          this.successMessage = 'Projet mis à jour avec succès';
          this.onSuccess();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'Erreur lors de la mise à jour du projet');
        }
      });
    } else {
      this.projectService.createProject({ body: this.newProject }).subscribe({
        next: () => {
          this.successMessage = 'Projet créé avec succès';
          this.onSuccess();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'Erreur lors de la création du projet');
        }
      });
    }
  }

  // Préparer le formulaire pour modification
  editProject(project: Project): void {
    this.isEditing = true;
    this.editingId = project.id ?? null;
    this.newProject = { ...project };
  }

  // Supprimer un projet
  deleteProject(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce projet ?')) {
      this.projectService.deleteProject({ id }).subscribe({
        next: () => {
          this.successMessage = 'Projet supprimé avec succès';
          this.loadProjects();
          this.loadMissionsCount();
          this.clearMessages();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'Erreur lors de la suppression du projet');
        }
      });
    }
  }

  // Réinitialiser le formulaire après succès
  onSuccess(): void {
    this.loadProjects();
    this.loadMissionsCount();
    this.newProject = { name: '', code: '', clientname: '' };
    this.isEditing = false;
    this.editingId = null;
    this.clearMessages();
  }

  /**
   * Obtenir les projets filtrés
   */
  get filteredProjects(): Project[] {
    return this.projects.filter(project => {
      const nameMatch = !this.nameFilter ||
        project.name?.toLowerCase().includes(this.nameFilter.toLowerCase());
      const codeMatch = !this.codeFilter ||
        project.code?.toLowerCase().includes(this.codeFilter.toLowerCase());
      const clientMatch = !this.clientFilter ||
        project.clientname?.toLowerCase().includes(this.clientFilter.toLowerCase());

      return nameMatch && codeMatch && clientMatch;
    });
  }

  /**
   * Réinitialiser tous les filtres
   */
  clearFilters(): void {
    this.nameFilter = '';
    this.codeFilter = '';
    this.clientFilter = '';
  }

  /**
   * Obtenir les clients uniques pour suggestions
   */
  get uniqueClients(): string[] {
    const clients = new Set<string>();
    this.projects.forEach(project => {
      if (project.clientname) clients.add(project.clientname);
    });
    return Array.from(clients).sort();
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
   * TrackBy function pour optimiser les performances de *ngFor
   */
  trackByProjectId(index: number, item: Project): number {
    return item.id || index;
  }

  /**
   * Méthode pour déboguer (utile en développement)
   */
  debugInfo(): void {
    console.log('=== DEBUG PROJET LISTE ===');
    console.log('Total projects:', this.projects.length);
    console.log('Filtered projects:', this.filteredProjects.length);
    console.log('Filters:', {
      name: this.nameFilter,
      code: this.codeFilter,
      client: this.clientFilter
    });
    console.log('Unique clients:', this.uniqueClients);
    console.log('===========================');
  }
}

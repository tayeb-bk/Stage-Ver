import { Component } from '@angular/core';
import { KeycloakS } from '../../utils/keycloakService/keycloak-s';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(public keycloakService: KeycloakS) {}

  openAccountManagement() {
    this.keycloakService.accountManagement();
  }

  refreshToken() {
    // Logique pour actualiser le token
    console.log('Actualisation du token...');
  }
} 
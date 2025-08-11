import { Component } from '@angular/core';
import { KeycloakS } from '../../utils/keycloakService/keycloak-s';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  constructor(public keycloakService: KeycloakS) {}

  getInitials(): string {
    const name = this.keycloakService.fullName || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  openAccountManagement() {
    this.keycloakService.accountManagement();
  }

  goToDashboard() {
    window.location.href = '/dashboard';
  }
}

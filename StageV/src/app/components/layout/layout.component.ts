import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeycloakS } from '../../utils/keycloakService/keycloak-s';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  constructor(public keycloakService: KeycloakS) {}

  logout() {
    this.keycloakService.logout();
  }
} 
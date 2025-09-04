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
  private expandedGroups: Set<string> = new Set();

  constructor(public keycloakService: KeycloakS) {}

  logout() {
    this.keycloakService.logout();
  }
  toggleGroup(groupId: string) {
    if (this.expandedGroups.has(groupId)) {
      this.expandedGroups.delete(groupId);
    } else {
      // Optionnel : fermer les autres groupes (accordion behavior)
      // this.expandedGroups.clear();
      this.expandedGroups.add(groupId);
    }
  }

  isGroupExpanded(groupId: string): boolean {
    return this.expandedGroups.has(groupId);
  }
}

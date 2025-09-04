import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class KeycloakS {
  private _keycloak: Keycloak | undefined;

  constructor() {}

  get keycloak() {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: 'http://localhost:8080',
        realm: 'stage-realm',
        clientId: 'stage-client',
      });
    }
    return this._keycloak;
  }

  async init() {
    await this.keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false
    });
  }

  async login() {
    await this.keycloak.login();
  }

  async logout() {
    return this.keycloak.logout({redirectUri: 'http://localhost:4200'});
  }

  get token(): string | undefined {
    return this.keycloak.token;
  }

  get isTokenValid(): boolean {
    return !this.keycloak.isTokenExpired();
  }
  get userId(): string | undefined {
    return this.keycloak?.tokenParsed?.sub as string;
  }

  get fullName(): string | undefined {
    return this.keycloak.tokenParsed?.['name'] as string;
  }

  accountManagement() {
    return this.keycloak.accountManagement();
  }
  /**
   * Récupérer tous les rôles de l'utilisateur
   */
  get roles(): string[] {
    const realmRoles = this.keycloak.tokenParsed?.realm_access?.roles || [];
    const clientRoles = Object.values(this.keycloak.tokenParsed?.resource_access || {})
      .flatMap((r: any) => r.roles || []);
    return Array.from(new Set([...realmRoles, ...clientRoles]));
  }

  /**
   * Vérifie si l'utilisateur a un rôle précis
   */
  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  isOfficer(): boolean {
    return this.hasRole('ROLE_OFFICER');
  }

  isPManager(): boolean {
    return this.hasRole('ROLE_PMANAGER');
  }

  isTManager(): boolean {
    return this.hasRole('ROLE_TMANAGER');
  }

  isMember(): boolean {
    return this.hasRole('ROLE_MEMBER');
  }
  isHeadMarket(): boolean {
    return this.roles.includes('ROLE_HEAD_MARKET'); // ✅ ajout pour Step 2
  }
}

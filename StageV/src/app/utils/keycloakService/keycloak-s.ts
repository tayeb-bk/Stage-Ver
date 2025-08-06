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
        url: 'http://localhost:8080', // ← adapte ici si besoin
        realm: 'stage-realm',              // ← adapte ici
        clientId: 'stage-client',          // ← adapte ici
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
}

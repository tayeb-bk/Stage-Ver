import {
  ApplicationConfig, inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { KeycloakS } from './utils/keycloakService/keycloak-s';
import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {keycloakHttpInterceptor} from './utils/http/keycloak-http-interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([keycloakHttpInterceptor])
    ),
    provideAppInitializer(() => {
      const initFn = ((key: KeycloakS) => {
        return () => key.init().catch(error => {
          console.warn('Keycloak initialization failed, continuing without authentication:', error);
          return Promise.resolve();
        });
      })(inject(KeycloakS));
      return initFn();
    })
  ]
};

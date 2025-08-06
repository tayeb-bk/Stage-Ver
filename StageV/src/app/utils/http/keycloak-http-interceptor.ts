import { HttpInterceptorFn } from '@angular/common/http';

import { inject } from '@angular/core';
import { KeycloakS } from '../keycloakService/keycloak-s';

export const keycloakHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakS);
  const token = keycloakService.token;
  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }
  return next(req);
};

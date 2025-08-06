import { TestBed } from '@angular/core/testing';

import { KeycloakS } from './keycloak-s';

describe('KeycloakS', () => {
  let service: KeycloakS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeycloakS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

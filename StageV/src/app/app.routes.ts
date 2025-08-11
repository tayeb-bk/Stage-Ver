import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LayoutComponent } from './components/layout/layout.component';
import {PasseportComponent} from './components/Passport/Passeport.component';
import {PasseportListeComponent} from './components/PasseportListe/PasseportListe.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'passport',
        component: PasseportComponent
      },
      {
        path: 'passportliste',
        component: PasseportListeComponent
      }

    ]
  }
];

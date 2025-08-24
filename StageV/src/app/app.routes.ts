import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LayoutComponent } from './components/layout/layout.component';
import {PasseportComponent} from './components/Passport/Passeport.component';
import {PasseportListeComponent} from './components/PasseportListe/PasseportListe.component';
import {VisaRequestComponent} from './components/visa-request/visa-request.component';
import { VisaListeComponent } from './components/VisaListe/visa-liste.component';
import {ProjectComponent} from './components/Project/project.component';
import {MissionComponent} from './components/Mission/mission.component';
import {TravelRequestComponent} from './components/travel-request/travel-request.component';

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
      },
      {
        path: 'visa-request',
        component: VisaRequestComponent
      },
      {
        path: 'visa-liste',
        component: VisaListeComponent
      },
      {
        path: 'project',
        component: ProjectComponent
      },{
        path: 'mission',
        component: MissionComponent
      },{
        path: 'travel',
        component: TravelRequestComponent
      }

    ]
  }
];

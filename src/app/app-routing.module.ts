import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Auth Guard
import { AuthGuard } from './shared/guards/auth.guard';

// Page Components
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ReportingComponent } from './pages/reporting/reporting.component';

// Users Components
import { UsersListComponent } from './pages/users/users-list/users-list.component';
import { UserDetailComponent } from './pages/users/user-detail/user-detail.component';
import { UserFormComponent } from './pages/users/user-form/user-form.component';

// Vehicles Components
import { VehiclesListComponent } from './pages/vehicles/vehicles-list/vehicles-list.component';
import { VehicleDetailComponent } from './pages/vehicles/vehicle-detail/vehicle-detail.component';
import { VehicleFormComponent } from './pages/vehicles/vehicle-form/vehicle-form.component';

// Missions Components
import { MissionsListComponent } from './pages/missions/missions-list/missions-list.component';
import { MissionDetailComponent } from './pages/missions/mission-detail/mission-detail.component';
import { MissionFormComponent } from './pages/missions/mission-form/mission-form.component';

// Drivers Components
import { DriversListComponent } from './pages/drivers/drivers-list/drivers-list.component';
import { DriverDetailComponent } from './pages/drivers/driver-detail/driver-detail.component';
import { DriverFormComponent } from './pages/drivers/driver-form/driver-form.component';

// Fuel Components
import { FuelListComponent } from './pages/fuel/fuel-list/fuel-list.component';
import { FuelDetailComponent } from './pages/fuel/fuel-detail/fuel-detail.component';
import { FuelFormComponent } from './pages/fuel/fuel-form/fuel-form.component';

// Maintenance Components
import { MaintenanceListComponent } from './pages/maintenance/maintenance-list/maintenance-list.component';
import { MaintenanceDetailComponent } from './pages/maintenance/maintenance-detail/maintenance-detail.component';
import { MaintenanceFormComponent } from './pages/maintenance/maintenance-form/maintenance-form.component';
import { FuelStockListComponent } from './pages/fuel-stock/fuel-stock-list/fuel-stock-list.component';
import { FuelStockFormComponent } from './pages/fuel-stock/fuel-stock-form/fuel-stock-form.component';
import { FuelStockDetailComponent } from './pages/fuel-stock/fuel-stock-detail/fuel-stock-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  
  // Auth routes (lazy loaded)
  { 
    path: 'auth/login', 
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  
  // Protected routes
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'reporting', component: ReportingComponent },
  
  // Users routes
  { path: 'users', component: UsersListComponent, canActivate: [AuthGuard] },
  { path: 'users/new', component: UserFormComponent, canActivate: [AuthGuard] },
  { path: 'users/:id', component: UserDetailComponent, canActivate: [AuthGuard] },
  { path: 'users/edit/:id', component: UserFormComponent, canActivate: [AuthGuard] },
  
  // Vehicles routes
  { path: 'vehicles', component: VehiclesListComponent, canActivate: [AuthGuard] },
  { path: 'vehicles/new', component: VehicleFormComponent, canActivate: [AuthGuard] },
  { path: 'vehicles/:id', component: VehicleDetailComponent, canActivate: [AuthGuard] },
  { path: 'vehicles/edit/:id', component: VehicleFormComponent, canActivate: [AuthGuard] },
  
  // Missions routes
  { path: 'missions', component: MissionsListComponent, canActivate: [AuthGuard] },
  { path: 'missions/new', component: MissionFormComponent, canActivate: [AuthGuard] },
  { path: 'missions/:id', component: MissionDetailComponent, canActivate: [AuthGuard] },
  { path: 'missions/edit/:id', component: MissionFormComponent, canActivate: [AuthGuard] },
  
  // Drivers routes
  { path: 'drivers', component: DriversListComponent, canActivate: [AuthGuard] },
  { path: 'drivers/new', component: DriverFormComponent, canActivate: [AuthGuard] },
  { path: 'drivers/:id', component: DriverDetailComponent, canActivate: [AuthGuard] },
  { path: 'drivers/edit/:id', component: DriverFormComponent, canActivate: [AuthGuard] },
  
  // Fuel routes
  { path: 'fuel', component: FuelListComponent, canActivate: [AuthGuard] },
  { path: 'fuel/new', component: FuelFormComponent, canActivate: [AuthGuard] },
  { path: 'fuel/:id', component: FuelDetailComponent, canActivate: [AuthGuard] },
  { path: 'fuel/edit/:id', component: FuelFormComponent, canActivate: [AuthGuard] },
  
  // Maintenance routes
  { path: 'maintenance', component: MaintenanceListComponent, canActivate: [AuthGuard] },
  { path: 'maintenance/new', component: MaintenanceFormComponent, canActivate: [AuthGuard] },
  { path: 'maintenance/:id', component: MaintenanceDetailComponent, canActivate: [AuthGuard] },
  { path: 'maintenance/edit/:id', component: MaintenanceFormComponent, canActivate: [AuthGuard] },


    // Fuel Stock routes
  { path: 'fuel-stock', component: FuelStockListComponent, canActivate: [AuthGuard] },
  { path: 'fuel-stock/new', component: FuelStockFormComponent, canActivate: [AuthGuard] },
  { path: 'fuel-stock/:id', component: FuelStockDetailComponent, canActivate: [AuthGuard] },
  { path: 'fuel-stock/edit/:id', component: FuelStockFormComponent, canActivate: [AuthGuard] },
  
  // Wildcard route for 404
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
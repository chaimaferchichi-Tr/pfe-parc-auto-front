import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';





import { AppComponent } from './app.component';

// Shared Components
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { PaginationComponent } from './shared/components/pagination/pagination.component';

// Page Components
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';

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
import { MaintenanceListComponent } from './pages/maintenance/maintenance-list/maintenance-list.component';
import { MaintenanceDetailComponent } from './pages/maintenance/maintenance-detail/maintenance-detail.component';
import { MaintenanceFormComponent } from './pages/maintenance/maintenance-form/maintenance-form.component';
import { FuelStockListComponent } from './pages/fuel-stock/fuel-stock-list/fuel-stock-list.component';
import { FuelStockDetailComponent } from './pages/fuel-stock/fuel-stock-detail/fuel-stock-detail.component';
import { FuelStockFormComponent } from './pages/fuel-stock/fuel-stock-form/fuel-stock-form.component';
import { AppRoutingModule } from './app-routing.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SomeNonZeroPipe } from './shared/pipes/some-non-zero.pipe';
import { ReportingComponent } from './pages/reporting/reporting.component';
import { FuelReportComponent } from './pages/reporting/fuel-report.component';




@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    PaginationComponent,
    DashboardComponent,
    ProfileComponent,
    // Users components
    UsersListComponent,
    UserDetailComponent,
    UserFormComponent,
    // Vehicles components
    VehiclesListComponent,
    VehicleDetailComponent,
    VehicleFormComponent,
    // Missions components
    MissionsListComponent,
    MissionDetailComponent,
    MissionFormComponent,
    // Drivers components
    DriversListComponent,
    DriverDetailComponent,
    DriverFormComponent,
    // Fuel components
    FuelListComponent,
    FuelDetailComponent,
    FuelFormComponent,
    // Do NOT declare MaintenanceFormComponent here
    MaintenanceListComponent,
    MaintenanceDetailComponent,
    MaintenanceFormComponent,

    //Fuel stock components
    FuelStockListComponent,
    FuelStockDetailComponent,
    FuelStockFormComponent,
    ReportingComponent,
    FuelReportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgApexchartsModule,
    SomeNonZeroPipe
  ],
  providers: [
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
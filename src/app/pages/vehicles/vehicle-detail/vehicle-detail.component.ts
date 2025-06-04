import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../../shared/services/vehicle.service';
import { UserService } from '../../../shared/services/user.service';
import { MaintenanceService } from 'src/app/shared/services/maintenance.service';
import { FuelService } from 'src/app/shared/services/fuel.service';
import { MissionService } from 'src/app/shared/services/mission.service';
import { Vehicle } from '../../../shared/models/vehicle.model';
import { User } from '../../../shared/models/user.model';
import { Maintenance } from 'src/app/shared/models/maintenance.model';
import { FuelRecord } from 'src/app/shared/models/fuel-record.model';
import { Mission } from 'src/app/shared/models/mission.model';
import { CommonModule, DatePipe } from '@angular/common';

interface FuelMissionSummary {
  _id: string;
  missionTitle: string;
  missionStatus: string;
  missionStartDate: string;
  missionEndDate: string;
  missionStartLocation: string;
  missionDestination: string;
  totalFuelQuantity: number;
  totalFuelCost: number;
}

@Component({
  selector: 'app-vehicle-detail',
  templateUrl: './vehicle-detail.component.html',
  styleUrls: ['./vehicle-detail.component.scss'],
  standalone: false,
  // imports: [CommonModule, DatePipe]
})
export class VehicleDetailComponent implements OnInit {
  vehicle: Vehicle | null = null;
  assignedDriver: User | null = null;
  loading = false;
  error: string | null = null;

  showMaintenanceList = false;
  maintenanceList: Maintenance[] = [];
  fullMaintenanceList: Maintenance[] = [];
  maintenanceLoading = false;
  maintenanceError = '';

  showFuelConsumptionList = false;
  fuelList: FuelMissionSummary[] = [];
  filteredFuelList: FuelMissionSummary[] = [];
  fuelLoading = false;
  fuelError = '';
  missions: Mission[] = [];
  missionOptions: { _id: string, title: string }[] = [];
  selectedMission: string = '';
  selectedMaintenanceType: string = '';

  // Add new filter for maintenance date (upcoming/passed)
  selectedMaintenanceDateFilter: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private userService: UserService,
    private maintenanceService: MaintenanceService,
    private fuelService: FuelService,
    private missionService: MissionService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log("Vehicle ID from route:", id);
      this.loadVehicle(id);
      if (id) {
        this.loadVehicle(id);
      }
    });
  }

  loadVehicle(id: any): void {
    this.loading = true;
    this.error = null;

    this.vehicleService.getVehicle(id).subscribe({
      next: (vehicle) => {
        this.vehicle = vehicle || null;
        
        if (vehicle && vehicle.assignedTo) {
          this.loadAssignedDriver(vehicle.assignedTo);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading vehicle:', err);
        this.error = 'Failed to load vehicle details. Please try again.';
        this.loading = false;
      }
    });
  }

  loadAssignedDriver(driverId: any): void {
    this.userService.getUser(driverId).subscribe({
      next: (user) => {
        this.assignedDriver = user || null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading assigned driver:', err);
        this.loading = false;
      }
    });
  }

  editVehicle(): void {
    if (this.vehicle) {
      this.router.navigate(['/vehicles/edit', this.vehicle._id]);
    }
  }

  async deleteVehicle(): Promise<void> {
    if (!this.vehicle) return;
    const Swal = (await import('sweetalert2')).default;
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this vehicle?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehicleService.deleteVehicle(this.vehicle!._id).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire('Deleted!', 'Vehicle has been deleted.', 'success').then(() => {
                this.router.navigate(['/vehicles']);
              });
            } else {
              Swal.fire('Error', 'Failed to delete vehicle.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to delete vehicle. Please try again.', 'error');
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/vehicles']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Available':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'On Mission':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'In Maintenance':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'Out of Service':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  }

  openMaintenanceList() {
    this.showMaintenanceList = true;
    this.maintenanceLoading = true;
    this.maintenanceError = '';
    this.selectedMaintenanceType = '';
    this.selectedMaintenanceDateFilter = '';
    this.maintenanceService.getAllMaintenances().subscribe({
      next: (list) => {
        this.fullMaintenanceList = list.filter(m => {
          if (!m.vehicle) return false;
          if (typeof m.vehicle === 'string') {
            return m.vehicle === this.vehicle!._id;
          } else if (typeof m.vehicle === 'object' && m.vehicle._id) {
            return m.vehicle._id === this.vehicle!._id;
          }
          return false;
        });
        this.filterMaintenanceByType();
        this.maintenanceLoading = false;
      },
      error: (err) => {
        this.maintenanceError = 'Failed to load maintenance records.';
        this.maintenanceLoading = false;
      }
    });
  }

  filterMaintenanceByType() {
    let filtered = [...this.fullMaintenanceList];
    if (this.selectedMaintenanceType) {
      const type = this.selectedMaintenanceType.toLowerCase();
      filtered = filtered.filter(m =>
        m.maintenanceType && m.maintenanceType.toLowerCase().includes(type)
      );
    }
    // Add date filter
    if (this.selectedMaintenanceDateFilter) {
      const today = new Date();
      if (this.selectedMaintenanceDateFilter === 'upcoming') {
        filtered = filtered.filter(m => new Date(m.date) > today);
      } else if (this.selectedMaintenanceDateFilter === 'passed') {
        filtered = filtered.filter(m => new Date(m.date) <= today);
      }
    }
    this.maintenanceList = filtered;
  }

  refreshMaintenanceFilters() {
    this.selectedMaintenanceType = '';
    this.selectedMaintenanceDateFilter = '';
    this.filterMaintenanceByType();
  }

  closeMaintenanceList() {
    this.showMaintenanceList = false;
  }

  openFuelConsumptionList() {
    this.showFuelConsumptionList = true;
    this.fuelLoading = true;
    this.fuelError = '';
    if (!this.vehicle?._id) return;
    this.fuelService.getFuelConsumptionByVehicleMissions(this.vehicle._id).subscribe({
      next: (list) => {
        this.fuelList = list;
        this.filteredFuelList = [...this.fuelList];
        // Set mission options for dropdown
        this.missionOptions = list.map(m => ({ _id: m._id, title: m.missionTitle }));
        this.fuelLoading = false;
      },
      error: () => {
        this.fuelError = 'Failed to load fuel consumption records.';
        this.fuelLoading = false;
      }
    });
  }

  closeFuelConsumptionList() {
    this.showFuelConsumptionList = false;
    this.selectedMission = '';
    this.filteredFuelList = [];
  }

  filterFuelByMission() {
    if (!this.selectedMission) {
      this.filteredFuelList = [...this.fuelList];
    } else {
      this.filteredFuelList = this.fuelList.filter(f => f._id === this.selectedMission);
    }
  }
}
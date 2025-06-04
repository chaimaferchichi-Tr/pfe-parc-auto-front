import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Vehicle } from '../../../shared/models/vehicle.model';
import { VehicleService } from '../../../shared/services/vehicle.service';

@Component({
  selector: 'app-vehicles-list',
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.scss'],
  standalone: false
})
export class VehiclesListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  statusFilters: { label: string, value: string, count: number }[] = [
    { label: 'All Statuses', value: '', count: 0 },
    { label: 'Available', value: 'Available', count: 0 },
    { label: 'On Mission', value: 'On Mission', count: 0 },
    { label: 'In Maintenance', value: 'In Maintenance', count: 0 },
    { label: 'Out of Service', value: 'Out of Service', count: 0 }
  ];
  
  selectedStatus = '';

  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading = true;
    this.error = null;

    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        console.log('Vehicles loaded:', this.vehicles);
        this.updateFilters();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading vehicles:', err);
        this.error = 'Failed to load vehicles. Please try again.';
        this.loading = false;
      }
    });
  }

  updateFilters(): void {
    // Reset counts
    this.statusFilters.forEach(filter => filter.count = 0);
    
    // Count for All Statuses
    this.statusFilters[0].count = this.vehicles.length;
    
    // Count for each status
    this.vehicles.forEach(vehicle => {
      const statusFilter = this.statusFilters.find(filter => filter.value === vehicle.status);
      if (statusFilter) {
        statusFilter.count++;
      }
    });
  }

  applyFilters(): void {
    this.filteredVehicles = this.vehicles.filter(vehicle => {
      const matchesSearch = !this.searchTerm || 
        vehicle.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vehicle.licensePlate.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vehicle.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vehicle.status.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || vehicle.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
    
    this.totalItems = this.filteredVehicles.length;
    this.currentPage = 1; // Reset to first page when filters change
  }

  search(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  get paginatedVehicles(): Vehicle[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredVehicles.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  viewVehicle(id: number): void {
    this.router.navigate(['/vehicles', id]);
  }

  editVehicle(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/vehicles/edit', id]);
  }

  deleteVehicle(id: any, event: Event): void {
    event.stopPropagation();
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'Are you sure?',
        text: 'Do you really want to delete this vehicle?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.vehicleService.deleteVehicle(id).subscribe({
            next: (success) => {
              if (success) {
                Swal.default.fire('Deleted!', 'Vehicle has been deleted.', 'success');
                this.loadVehicles();
              } else {
                Swal.default.fire('Error', 'Failed to delete vehicle.', 'error');
              }
            },
            error: (err) => {
              Swal.default.fire('Error', 'Failed to delete vehicle. Please try again.', 'error');
            }
          });
        }
      });
    });
  }

  addNewVehicle(): void {
    this.router.navigate(['/vehicles/new']);
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
}
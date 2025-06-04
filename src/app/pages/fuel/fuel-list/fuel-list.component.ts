import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FuelRecord } from '../../../shared/models/fuel-record.model';
import { FuelService } from '../../../shared/services/fuel.service';
import { Mission } from '../../../shared/models/mission.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-fuel-list',
  templateUrl: './fuel-list.component.html',
  styleUrls: ['./fuel-list.component.scss']
})
export class FuelListComponent implements OnInit {
  fuelRecords: FuelRecord[] = [];
  filteredRecords: FuelRecord[] = [];
  loading = true;
  searchTerm = '';
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  
  // Sorting
  sortBy = 'date';
  sortDirection = 'desc';
  
  // Filters
  vehicleFilter = 'all';
  fuelTypeFilter = 'all';

  constructor(private fuelService: FuelService, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadFuelRecords();
  }

  loadFuelRecords(): void {
    this.loading = true;
    this.fuelService.getFuelRecords().subscribe({
      next: (records) => {
        const currentUser = this.authService.currentUserValue;
        if (currentUser && currentUser.role === 'driver') {
          this.fuelRecords = records.filter(record =>
            record.mission &&
            record.mission.driver &&
            record.mission.driver.user &&
            record.mission.driver.user._id === currentUser._id
          );
        } else {
          this.fuelRecords = records;
        }
        console.log('Fuel Records:', this.fuelRecords);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading fuel records:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.fuelRecords];

    // Vehicle filter (from mission)
    if (this.vehicleFilter !== 'all') {
      result = result.filter(record => record.mission && record.mission.vehicle && record.mission.vehicle._id === this.vehicleFilter);
    }

    // Fuel type filter
    if (this.fuelTypeFilter !== 'all') {
      result = result.filter(record => record.fuelType === this.fuelTypeFilter);
    }

    // Search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(record => {
        const vehicleName = record.mission?.vehicle?.name || '';
        const driverName = record.mission?.driver?.user?.name || '';
        return (
          vehicleName.toLowerCase().includes(term) ||
          driverName.toLowerCase().includes(term)
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      let aValue: any = a[this.sortBy as keyof FuelRecord];
      let bValue: any = b[this.sortBy as keyof FuelRecord];
      if (this.sortBy === 'date') {
        aValue = new Date(a.date || '');
        bValue = new Date(b.date || '');
      }
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredRecords = result;
    this.totalItems = result.length;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) {
      return 'M3 4h13M3 8h9m-9 4h6';
    }
    return this.sortDirection === 'asc' 
      ? 'M3 4h13M3 8h9m5-4v12m0 0l-4-4m4 4l4-4' 
      : 'M3 4h13M3 8h9m5-4v12m0 0l-4-4m4 4l4-4';
  }

  onVehicleFilterChange(vehicleId: string): void {
    this.vehicleFilter = vehicleId;
    this.currentPage = 1;
    this.applyFilters();
  }

  onFuelTypeFilterChange(fuelType: string): void {
    this.fuelTypeFilter = fuelType;
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  viewFuelRecord(id: number): void {
    this.router.navigate(['/fuel', id]);
  }

  editFuelRecord(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/fuel/edit', id]);
  }

  addFuelRecord(): void {
    this.router.navigate(['/fuel/new']);
  }

  confirmDelete(id: string, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteFuelRecord(id);
      }
    });
  }

  deleteFuelRecord(id: string): void {
    this.fuelService.deleteFuelRecord(id).subscribe({
      next: () => {
        Swal.fire('Deleted!', 'Fuel record has been deleted.', 'success');
        this.loadFuelRecords();
      },
      error: () => {
        Swal.fire('Error', 'Failed to delete fuel record.', 'error');
      }
    });
  }

  get displayedRecords(): FuelRecord[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRecords.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Helper methods for template
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getFuelTypeClass(fuelType: string): string {
    switch (fuelType) {
      case 'Diesel':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Gasoline':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Electric':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  get uniqueVehicles(): { id: string; name: string }[] {
    const vehicles: { id: string; name: string }[] = [];
    const vehicleIds = new Set<string>();
    this.fuelRecords.forEach(record => {
      const vehicle = record.mission?.vehicle;
      if (vehicle && !vehicleIds.has(vehicle._id)) {
        vehicleIds.add(vehicle._id);
        vehicles.push({ id: vehicle._id, name: vehicle.name || `Vehicle` });
      }
    });
    return vehicles.sort((a, b) => a.name.localeCompare(b.name));
  }

  get uniqueFuelTypes(): string[] {
    const fuelTypes = new Set<string>();
    this.fuelRecords.forEach(record => fuelTypes.add(record.fuelType));
    return Array.from(fuelTypes).sort();
  }
}
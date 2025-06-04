import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Driver } from '../../../shared/models/driver.model';
import { DriverService } from '../../../shared/services/driver.service';
import { UserService } from '../../../shared/services/user.service';
import Swal from 'sweetalert2';

@Component({
  standalone: false,
  selector: 'app-drivers-list',
  templateUrl: './drivers-list.component.html',
  styleUrls: ['./drivers-list.component.scss']
})
export class DriversListComponent implements OnInit {
  drivers: Driver[] = [];
  filteredDrivers: Driver[] = [];
  loading = true;
  searchTerm = '';
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  
  // Sorting
  sortBy = 'name';
  sortDirection = 'asc';
  
  // Filters
  statusFilter = 'all';

  constructor(private driverService: DriverService, private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.loading = true;
    this.driverService.getDrivers().subscribe({
      next: (drivers) => {
        this.drivers = drivers;
        console.log('Drivers loaded:', this.drivers);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading drivers:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.drivers];
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      result = result.filter(driver => driver.status === this.statusFilter);
    }
    
    // Apply search (search in user.name, user.email, licenseNumber, status, experience)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(driver =>
        (driver.user?.name && driver.user.name.toLowerCase().includes(term)) ||
        (driver.user?.email && driver.user.email.toLowerCase().includes(term)) ||
        (driver.licenseNumber && driver.licenseNumber.toLowerCase().includes(term)) ||
        (driver.status && driver.status.toLowerCase().includes(term)) ||
        (driver.experience && driver.experience.toString().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue: any = a[this.sortBy as keyof typeof a];
      let bValue: any = b[this.sortBy as keyof typeof b];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    this.filteredDrivers = result;
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
      ? 'M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4' 
      : 'M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4';
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'On Mission':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  viewDriver(id: string): void {
    this.router.navigate(['/drivers', id]);
  }

  editDriver(id: number, event: Event): void {
    console.log('Editing driver with ID:', id);
    event.stopPropagation();
    this.router.navigate(['/drivers/edit', id]);
  }

  addDriver(): void {
    this.router.navigate(['/drivers/new']);
  }

  deleteDriver(id: number, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this driver?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.driverService.deleteDriver(id).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire('Deleted!', 'Driver has been deleted.', 'success');
              this.loadDrivers();
            } else {
              Swal.fire('Error', 'Failed to delete driver.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to delete driver. Please try again.', 'error');
          }
        });
      }
    });
  }

  blockDriver(id: any, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: 'Block Driver',
      text: 'Are you sure you want to block this driver? They will not be available for assignments.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e42',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, block'
    }).then((result) => {
      if (result.isConfirmed) {
        const driver = this.drivers.find(d => d._id === id);
        if (driver && driver.user) {
          this.userService.blockUser(driver.user._id || driver.user._id).subscribe({
            next: () => {
              Swal.fire('Blocked!', 'Driver account has been set to inactive.', 'success');
              this.loadDrivers();
            },
            error: () => {
              Swal.fire('Error', 'Failed to block driver account. Please try again.', 'error');
            }
          });
        }
      }
    });
  }

  get displayedDrivers(): Driver[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDrivers.slice(startIndex, startIndex + this.itemsPerPage);
  }
}
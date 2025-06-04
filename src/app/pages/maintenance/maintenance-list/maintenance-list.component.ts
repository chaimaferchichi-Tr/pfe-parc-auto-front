import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MaintenanceService } from 'src/app/shared/services/maintenance.service';
import { Maintenance } from 'src/app/shared/models/maintenance.model';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.scss'],
  standalone: false,
  // imports: [CommonModule, DatePipe]
})
export class MaintenanceListComponent implements OnInit {
  maintenances: Maintenance[] = [];
  filteredMaintenances: Maintenance[] = [];
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  loading = false;
  error: string | null = null;

  constructor(private maintenanceService: MaintenanceService, private router: Router) {}

  ngOnInit(): void {
    this.loadMaintenances();
  }

  loadMaintenances(): void {
    this.loading = true;
    this.maintenanceService.getAllMaintenances().subscribe({
      next: (data) => {
        console.log('Loading maintenances...',data);
        this.maintenances = data;
        this.applyFilters();
        console.log('Maintenances loaded:', data);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load maintenances.';
        this.loading = false;
      }
    });
  }

  addMaintenance(): void {
    this.router.navigate(['/maintenance/new']);
  }

  viewMaintenance(id: string | undefined): void {
    if (!id) return;
    this.router.navigate(['/maintenance', id]);
  }

  editMaintenance(id: string | undefined): void {
    if (!id) return;
    this.router.navigate(['/maintenance/edit', id]);
  }

  confirmDelete(id: string | undefined): void {
    if (!id) return;
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the maintenance record.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.maintenanceService.deleteMaintenance(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The maintenance record has been deleted.', 'success');
            this.loadMaintenances();
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete maintenance.', 'error');
          }
        });
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.maintenances];
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(m =>
        (m.title && m.title.toLowerCase().includes(term)) ||
        (m.maintenanceType && m.maintenanceType.toLowerCase().includes(term)) ||
        (m.vehicle && (typeof m.vehicle === 'string' ? m.vehicle.toLowerCase().includes(term) : m.vehicle.name?.toLowerCase().includes(term))) ||
        (m.status && m.status.toLowerCase().includes(term)) ||
        (m.odometerKm && m.odometerKm.toString().includes(term)) ||
        (m.cost && m.cost.toString().includes(term)) ||
        (m.date && new Date(m.date).toLocaleDateString().includes(term))
      );
    }
    this.filteredMaintenances = result;
    this.totalItems = result.length;
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  get paginatedMaintenances(): Maintenance[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMaintenances.slice(startIndex, startIndex + this.itemsPerPage);
  }
}

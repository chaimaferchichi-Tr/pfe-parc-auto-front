import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuelRecord } from '../../../shared/models/fuel-record.model';
import { FuelService } from '../../../shared/services/fuel.service';

@Component({
  standalone: false,
  selector: 'app-fuel-detail',
  templateUrl: './fuel-detail.component.html',
  styleUrls: ['./fuel-detail.component.scss']
})
export class FuelDetailComponent implements OnInit {
  fuelRecordId: number | null = null;
  fuelRecord: FuelRecord | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fuelService: FuelService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
        this.loadFuelRecord(idParam);
      
    });
  }

  loadFuelRecord(id: any): void {
    this.loading = true;
    this.fuelService.getFuelRecord(id).subscribe({
      next: (record) => {
        if (record) {
          this.fuelRecord = record;
        } else {
          this.error = 'Fuel record not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading fuel record:', err);
        this.error = 'Failed to load fuel record data. Please try again.';
        this.loading = false;
      }
    });
  }

  editFuelRecord(): void {
    if (this.fuelRecord && this.fuelRecord._id) {
      this.router.navigate(['/fuel/edit', this.fuelRecord._id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/fuel']);
  }

  goToVehicle(): void {
    if (this.fuelRecord && this.fuelRecord.mission && this.fuelRecord.mission.vehicle && this.fuelRecord.mission.vehicle._id) {
      this.router.navigate(['/vehicles', this.fuelRecord.mission.vehicle._id]);
    }
  }

  goToDriver(): void {
    if (this.fuelRecord && this.fuelRecord.mission && this.fuelRecord.mission.driver && this.fuelRecord.mission.driver._id) {
      this.router.navigate(['/drivers', this.fuelRecord.mission.driver._id]);
    }
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

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
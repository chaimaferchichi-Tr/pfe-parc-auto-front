import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Driver } from '../../../shared/models/driver.model';
import { DriverService } from '../../../shared/services/driver.service';

@Component({
  standalone: false,
  selector: 'app-driver-detail',
  templateUrl: './driver-detail.component.html',
  styleUrls: ['./driver-detail.component.scss']
})
export class DriverDetailComponent implements OnInit {
  driverId: string | null = null;
  driver: Driver | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private driverService: DriverService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.driverId = idParam;
        this.loadDriver(this.driverId);
      } else {
        this.error = 'Driver ID not provided';
        this.loading = false;
      }
    });
  }

  loadDriver(id: string): void {
    this.loading = true;
    this.driverService.getDriver(id).subscribe({
      next: (driver) => {
        if (driver) {
          this.driver = driver;
        } else {
          this.error = 'Driver not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading driver:', err);
        this.error = 'Failed to load driver data. Please try again.';
        this.loading = false;
      }
    });
  }

  editDriver(): void {
    if (this.driverId) {
      console.log("Navigating to edit driver with ID:", this.driverId);
      this.router.navigate(['/drivers/edit', this.driverId]);
 
    }
  }

  goBack(): void {
    this.router.navigate(['/drivers']);
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

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
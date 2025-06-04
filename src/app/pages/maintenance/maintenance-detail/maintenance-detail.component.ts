import { Component, OnInit } from '@angular/core';
import { MaintenanceService } from 'src/app/shared/services/maintenance.service';
import { Maintenance } from 'src/app/shared/models/maintenance.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-maintenance-detail',
  templateUrl: './maintenance-detail.component.html',
  styleUrls: ['./maintenance-detail.component.scss'],
  standalone: false,
  // imports: [CommonModule, DatePipe]
})
export class MaintenanceDetailComponent implements OnInit {
  maintenance: Maintenance | null = null;
  loading = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private maintenanceService: MaintenanceService, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.maintenanceService.getMaintenanceById(id).subscribe({
        next: (data) => {
          this.maintenance = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load maintenance.';
          this.loading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/maintenance']);
  }

  editMaintenance(id: string | undefined): void {
    if (!id) return;
    this.router.navigate(['/maintenance/edit', id]);
  }
}

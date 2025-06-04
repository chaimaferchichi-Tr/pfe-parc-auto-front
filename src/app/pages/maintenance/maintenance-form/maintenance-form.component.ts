import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MaintenanceService } from 'src/app/shared/services/maintenance.service';
import { Maintenance } from 'src/app/shared/models/maintenance.model';
import { VehicleService } from 'src/app/shared/services/vehicle.service';
import { Vehicle } from 'src/app/shared/models/vehicle.model';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-maintenance-form',
  templateUrl: './maintenance-form.component.html',
  styleUrls: ['./maintenance-form.component.scss'],
  standalone: false,
  // imports: [CommonModule, ReactiveFormsModule]
})
export class MaintenanceFormComponent implements OnInit {
  maintenanceForm: FormGroup;
  maintenanceId: string | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;
  error: string | null = null;
  vehicles: Vehicle[] = [];

  constructor(
    private fb: FormBuilder,
    private maintenanceService: MaintenanceService,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.maintenanceForm = this.fb.group({
      vehicle: ['', Validators.required],
      maintenanceType: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      date: ['', Validators.required],
      nextDueDate: [''],
      odometerKm: ['', Validators.required],
      garageName: [''],
      cost: ['', Validators.required],
      status: ['done', Validators.required]
    });
  }

  ngOnInit(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.maintenanceId = id;
      this.isEditMode = true;
      this.loadMaintenance(id);
    }
  }

  loadMaintenance(id: string): void {
    this.loading = true;
    this.maintenanceService.getMaintenanceById(id).subscribe({
      next: (data) => {
        this.maintenanceForm.patchValue(data);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load maintenance.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.maintenanceForm.invalid) {
      this.maintenanceForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const formValue = this.maintenanceForm.value;
    if (this.isEditMode && this.maintenanceId) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to update this maintenance record?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.maintenanceService.updateMaintenance(this.maintenanceId!, formValue).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Maintenance successfully updated!',
                showConfirmButton: false,
                timer: 1500
              }).then(() => {
                this.router.navigate(['/maintenance']);
              });
            },
            error: () => {
              this.error = 'Failed to update maintenance.';
              this.submitting = false;
            }
          });
        } else {
          this.submitting = false;
        }
      });
    } else {
      this.maintenanceService.createMaintenance(formValue).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Maintenance successfully added!',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.router.navigate(['/maintenance']);
          });
        },
        error: () => {
          this.error = 'Failed to add maintenance.';
          this.submitting = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/maintenance']);
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../../shared/services/vehicle.service';
import { Vehicle } from '../../../shared/models/vehicle.model';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss'],
  standalone: false
})
export class VehicleFormComponent implements OnInit {
  vehicleForm: FormGroup;
  vehicleId: any = null;
  isEditMode = false;
  loading = false;
  submitting = false;
  error: string | null = null;
  
  vehicleTypes = ['Van', 'Truck', 'Pickup', 'Heavy Truck', 'Light Truck'];
  statuses = ['Available', 'On Mission', 'In Maintenance', 'Out of Service'];
  fuelTypes = ['Diesel', 'Gasoline'];
  drivers: User[] = [];
  loadingDrivers = false;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Build form group differently for add and edit modes
    this.vehicleForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['Van', [Validators.required]],
      licensePlate: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]+$/)]],
      registrationNumber: ['', [Validators.required]],
      status: ['Available', [Validators.required]],
      fuelType: ['Diesel', [Validators.required]],
      mileage: [0, [Validators.required, Validators.min(0)]],
      model: ['', [Validators.required]],
      year: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadDrivers();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.vehicleId = id;
        this.isEditMode = true;
        this.loadVehicle(this.vehicleId);
      }
    });
  }

  loadVehicle(id: any): void {
    this.loading = true;
    this.error = null;

    this.vehicleService.getVehicle(id).subscribe({
      next: (vehicle) => {
        if (vehicle) {
          this.vehicleForm.patchValue({
            name: vehicle.name,
            type: vehicle.type,
            licensePlate: vehicle.licensePlate,
            registrationNumber: vehicle.registrationNumber,
            status: vehicle.status,
            fuelType: vehicle.fuelType,
            mileage: vehicle.mileage,
            lastMaintenance: this.formatDate(new Date(vehicle.lastMaintenance)),
            nextMaintenance: this.formatDate(new Date(vehicle.nextMaintenance)),
            purchaseDate: this.formatDate(new Date(vehicle.purchaseDate)),
            assignedTo: vehicle.assignedTo,
            model: vehicle.model,
            year: vehicle.year
          });
        } else {
          this.error = 'Vehicle not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading vehicle:', err);
        this.error = 'Failed to load vehicle details. Please try again.';
        this.loading = false;
      }
    });
  }
  
  loadDrivers(): void {
    this.loadingDrivers = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        // Filter users where role is 'Driver'
        this.drivers = users.filter(user => user.role === 'driver');
        this.loadingDrivers = false;
      },
      error: (err) => {
        console.error('Error loading drivers:', err);
        this.loadingDrivers = false;
      }
    });
  }

  onSubmit(): void {
    console.log('Form submission triggered'); // Debugging log
    if (this.vehicleForm.invalid) {
      console.log('Form is invalid:', this.vehicleForm.errors); // Debugging log

      // Debugging: Log errors for each control
      Object.keys(this.vehicleForm.controls).forEach(key => {
        const control = this.vehicleForm.get(key);
        console.log(`Control: ${key}, Errors:`, control?.errors);
        control?.markAsTouched();
      });

      return;
    }

    this.submitting = true;
    this.error = null;

    const formValues = this.vehicleForm.value;
    console.log('Form values:', formValues); // Debugging log

    // Only include fields present in the add form (no maintenance fields)
    const vehicleDataAdd = {
      name: formValues.name,
      type: formValues.type,
      licensePlate: formValues.licensePlate,
      registrationNumber: formValues.registrationNumber,
      status: formValues.status,
      fuelType: formValues.fuelType,
      mileage: formValues.mileage,
      model: formValues.model,
      year: formValues.year,
      lastMaintenance: new Date(),
      nextMaintenance: new Date(),
      purchaseDate: new Date(),
      assignedTo: null
    };

    const vehicleDataEdit = {
      ...vehicleDataAdd,
      lastMaintenance: new Date(formValues.lastMaintenance),
      nextMaintenance: new Date(formValues.nextMaintenance),
      purchaseDate: new Date(formValues.purchaseDate),
      assignedTo: formValues.assignedTo
    };

    if (this.isEditMode && this.vehicleId) {
      console.log('Updating vehicle with ID:', this.vehicleId); // Debugging log
      const updatedVehicle: Vehicle = {
        _id: this.vehicleId,
        ...vehicleDataEdit
      };

      this.vehicleService.updateVehicle(updatedVehicle).subscribe({
        next: (vehicle) => {
          console.log('Vehicle updated successfully:', vehicle); // Debugging log
          this.submitting = false;
          import('sweetalert2').then(Swal => {
            Swal.default.fire('Success', 'Vehicle successfully updated!', 'success').then(() => {
              this.router.navigate(['/vehicles']);
            });
          });
        },
        error: (err) => {
          console.error('Error updating vehicle:', err); // Debugging log
          this.error = 'Failed to update vehicle. Please try again.';
          this.submitting = false;
        }
      });
    } else {
      console.log('Adding new vehicle'); // Debugging log
      console.log('Form data entered by user:', vehicleDataAdd); // <-- Log only add fields
      this.vehicleService.addVehicle({ _id: undefined, ...vehicleDataAdd }).subscribe({
        next: (vehicle) => {
          console.log('Vehicle added successfully:', vehicle); // Debugging log
          this.submitting = false;
          import('sweetalert2').then(Swal => {
            Swal.default.fire('Success', 'Vehicle successfully added!', 'success').then(() => {
              this.router.navigate(['/vehicles']);
            });
          });
        },
        error: (err) => {
          console.error('Error adding vehicle:', err); // Debugging log
          this.error = 'Failed to add vehicle. Please try again.';
          this.submitting = false;
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.vehicleId) {
      this.router.navigate(['/vehicles', this.vehicleId]);
    } else {
      this.router.navigate(['/vehicles']);
    }
  }

  // Utility methods for date formatting
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private addMonths(date: Date, months: number): Date {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  }

  // Form controls getters for template access
  get nameControl() { return this.vehicleForm.get('name'); }
  get typeControl() { return this.vehicleForm.get('type'); }
  get licensePlateControl() { return this.vehicleForm.get('licensePlate'); }
  get statusControl() { return this.vehicleForm.get('status'); }
  get fuelTypeControl() { return this.vehicleForm.get('fuelType'); }
  get mileageControl() { return this.vehicleForm.get('mileage'); }
  get lastMaintenanceControl() { return this.vehicleForm.get('lastMaintenance'); }
  get nextMaintenanceControl() { return this.vehicleForm.get('nextMaintenance'); }
  get purchaseDateControl() { return this.vehicleForm.get('purchaseDate'); }
  get assignedToControl() { return this.vehicleForm.get('assignedTo'); }
}
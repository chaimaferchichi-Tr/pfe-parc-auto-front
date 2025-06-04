import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MissionService } from '../../../shared/services/mission.service';
import { VehicleService } from '../../../shared/services/vehicle.service';
import { UserService } from '../../../shared/services/user.service';
import { DriverService } from '../../../shared/services/driver.service';
import { Mission } from '../../../shared/models/mission.model';
import { Vehicle } from '../../../shared/models/vehicle.model';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-mission-form',
  templateUrl: './mission-form.component.html',
  styleUrls: ['./mission-form.component.scss'],
  standalone: false,
  // imports: [CommonModule, ReactiveFormsModule]
})
export class MissionFormComponent implements OnInit {
  missionForm: FormGroup;
  missionId: string | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;
  error: string | null = null;
  dateOverlapError: string | null = null;
  vehicleOverlapError: string | null = null;

  missionTypes = ['Delivery', 'Pickup', 'Transport', 'Service', 'Emergency'];
  statuses = ['Planned', 'In Progress', 'Completed', 'Cancelled'];
  priorities = ['Low', 'Medium', 'High'];
  vehicles: Vehicle[] = [];
  drivers: any[] = [];
  loadingVehicles = false;

  constructor(
    private fb: FormBuilder,
    private missionService: MissionService,
    private vehicleService: VehicleService,
    private userService: UserService,
    private driverService: DriverService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.missionForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      type: ['Delivery', [Validators.required]],
      status: ['Planned', [Validators.required]],
      priority: ['Medium', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      startLocation: [''],
      destination: [''],
      vehicle: [null],
      driver: [null],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadVehicles();
    this.loadDrivers();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.missionId = id;
        this.isEditMode = true;
        this.loadMission(this.missionId);
      }
    });

    // Watch for changes to startDate, endDate, driver, and vehicle
    this.missionForm.get('startDate')?.valueChanges.pipe(debounceTime(300)).subscribe(() => { this.checkDriverDateOverlap(); this.checkVehicleDateOverlap(); });
    this.missionForm.get('endDate')?.valueChanges.pipe(debounceTime(300)).subscribe(() => { this.checkDriverDateOverlap(); this.checkVehicleDateOverlap(); });
    this.missionForm.get('driver')?.valueChanges.pipe(debounceTime(300)).subscribe(() => this.checkDriverDateOverlap());
    this.missionForm.get('vehicle')?.valueChanges.pipe(debounceTime(300)).subscribe(() => this.checkVehicleDateOverlap());
  }

  loadMission(id: string): void {
    this.loading = true;
    this.error = null;

    this.missionService.getMission(id).subscribe({
      next: (mission) => {
        if (mission) {
          // Ensure vehicles and drivers are loaded before patching value
            console.log("missionn:", mission);
          Promise.all([
            this.vehicleService.getVehicles().toPromise(),
            this.driverService.getAvailableDrivers().toPromise()
          ]).then(([vehicles, drivers]) => {
            // Defensive: fallback to [] if undefined
            this.vehicles = (vehicles || []).filter(v => v.status === 'Available' || v._id === (mission.vehicle?._id || mission.vehicle));
            this.drivers = drivers || [];
            // Patch the form with the correct vehicle and driver _id
            let driverId = null;
            if (mission.driver) {
              console.log("Driver object in mission:", mission.driver);
              // If mission.driver is a Driver object with a user field, match by user._id
              if (mission.driver.user && mission.driver.user._id) {
                // Find the driver in the available drivers list whose user._id matches
                const found = this.drivers.find((d: any) => d.user && d.user._id === mission.driver.user._id);
                driverId = found ? found._id : (mission.driver._id || null);
              } else if (mission.driver._id) {
                // If mission.driver is a Driver object with _id
                driverId = mission.driver._id;
              } else {
                // If mission.driver is just an ID
                driverId = mission.driver;
              }
            }
            this.missionForm.patchValue({
              ...mission,
              startDate: mission.startDate ? this.formatDate(new Date(mission.startDate)) : '',
              endDate: mission.endDate ? this.formatDate(new Date(mission.endDate)) : '',
              vehicle: mission.vehicle?._id || mission.vehicle || null,
              driver: driverId
            });
          });
        } else {
          this.error = 'Mission not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading mission:', err);
        this.error = 'Failed to load mission.';
        this.loading = false;
      }
    });
  }
  
  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe(vehicles => {
      // Only show vehicles with status 'Available'
      this.vehicles = vehicles.filter(v => v.status === 'Available');
    });
  }

  loadDrivers(): void {
    // Use DriverService to get only available drivers
    this.driverService.getAvailableDrivers().subscribe(drivers => {
      this.drivers = drivers;
      console.log('Available drivers:', this.drivers);
    });
  }

  checkDriverDateOverlap(): void {
    this.dateOverlapError = null;
    const driverId = this.missionForm.get('driver')?.value;
    const startDate = this.missionForm.get('startDate')?.value;
    const endDate = this.missionForm.get('endDate')?.value;
    if (!driverId || !startDate || !endDate) return;
    // Check driver status is 'Available'
    const selectedDriver = this.drivers.find((d: any) => d._id === driverId);
    if (selectedDriver && selectedDriver.status !== 'Available') {
      this.dateOverlapError = 'Selected driver is not available.';
      return;
    }
    this.missionService.getMissionsByDriver(driverId).subscribe(missions => {
      // Exclude the current mission if editing
      const filtered = this.isEditMode && this.missionId ? missions.filter(m => m._id !== this.missionId) : missions;
      const newStart = new Date(startDate).getTime();
      const newEnd = new Date(endDate).getTime();
      const overlap = filtered.some(m => {
        const mStart = m.startDate ? new Date(m.startDate).getTime() : 0;
        const mEnd = m.endDate ? new Date(m.endDate).getTime() : 0;
        // Overlap if periods intersect and mission is Planned or In Progress
        return (m.status === 'Planned' || m.status === 'In Progress') &&
          ((newStart <= mEnd && newEnd >= mStart));
      });
      if (overlap) {
        this.dateOverlapError = 'This driver already has a mission planned or in progress during the selected period.';
      }
    });
  }

  checkVehicleDateOverlap(): void {
    this.vehicleOverlapError = null;
    const vehicleId = this.missionForm.get('vehicle')?.value;
    const startDate = this.missionForm.get('startDate')?.value;
    const endDate = this.missionForm.get('endDate')?.value;
    if (!vehicleId || !startDate || !endDate) return;
    this.missionService.getMissionsByVehicle(vehicleId).subscribe(missions => {
      // Exclude the current mission if editing
      const filtered = this.isEditMode && this.missionId ? missions.filter(m => m._id !== this.missionId) : missions;
      const newStart = new Date(startDate).getTime();
      const newEnd = new Date(endDate).getTime();
      const overlap = filtered.some(m => {
        const mStart = m.startDate ? new Date(m.startDate).getTime() : 0;
        const mEnd = m.endDate ? new Date(m.endDate).getTime() : 0;
        return (m.status === 'Planned' || m.status === 'In Progress') &&
          ((newStart <= mEnd && newEnd >= mStart));
      });
      if (overlap) {
        this.vehicleOverlapError = 'This vehicle is already assigned to another mission during the selected period.';
      }
    });
  }

  onSubmit(): void {
    if (this.missionForm.invalid || this.dateOverlapError || this.vehicleOverlapError) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.missionForm.controls).forEach(key => {
        const control = this.missionForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValue = this.missionForm.value;
    // Always send the selected driver id (not the nested user id)
    let driverId = formValue.driver;
    // If the selected driver is a driver object, extract its _id
    if (typeof driverId === 'object' && driverId !== null) {
      driverId = driverId._id || driverId.user?._id || null;
    }
    const payload = {
      ...formValue,
      vehicle: formValue.vehicle,
      driver: driverId
    };

    if (this.isEditMode && this.missionId) {
      // Update existing mission
      this.missionService.updateMission({ ...payload, _id: this.missionId }).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Mission updated successfully!',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.router.navigate(['/missions']);
          });
        },
        error: (err) => {
          console.error('Error updating mission:', err);
          this.error = 'Failed to update mission.';
          this.submitting = false;
        }
      });
    } else {
      // Create new mission
      this.missionService.addMission(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Mission added successfully!',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.router.navigate(['/missions']);
          });
        },
        error: (err) => {
          console.error('Error adding mission:', err);
          this.error = 'Failed to add mission.';
          this.submitting = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/missions']);
  }

  // Utility methods for date formatting
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  // Form controls getters for template access
  get titleControl() { return this.missionForm.get('title'); }
  get descriptionControl() { return this.missionForm.get('description'); }
  get typeControl() { return this.missionForm.get('type'); }
  get statusControl() { return this.missionForm.get('status'); }
  get priorityControl() { return this.missionForm.get('priority'); }
  get startDateControl() { return this.missionForm.get('startDate'); }
  get endDateControl() { return this.missionForm.get('endDate'); }
  get startLocationControl() { return this.missionForm.get('startLocation'); }
  get destinationControl() { return this.missionForm.get('destination'); }
  get vehicleControl() { return this.missionForm.get('vehicle'); }
  get driverControl() { return this.missionForm.get('driver'); }
  get notesControl() { return this.missionForm.get('notes'); }
}
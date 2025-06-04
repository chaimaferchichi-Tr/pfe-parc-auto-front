import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuelRecord } from '../../../shared/models/fuel-record.model';
import { FuelService } from '../../../shared/services/fuel.service';
import { Mission } from '../../../shared/models/mission.model';
import { MissionService } from '../../../shared/services/mission.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-fuel-form',
  templateUrl: './fuel-form.component.html',
  styleUrls: ['./fuel-form.component.scss']
})
export class FuelFormComponent implements OnInit {
  fuelForm: FormGroup;
  recordId: string | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;
  error: string | null = null;
  missions: Mission[] = [];
  fuelTypes = ['ticket', 'card'];
  drivers: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private fuelService: FuelService,
    private missionService: MissionService,
    private authService: AuthService // <-- Inject AuthService
  ) {
    this.fuelForm = this.fb.group({
      date: [this.formatDateForInput(new Date()), Validators.required],
      mission: [null, Validators.required],
      fuelType: ['ticket', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.1)]],
      cost: [0, [Validators.required, Validators.min(0.01)]],
      odometer: [null, Validators.min(0)],
      station: ['', Validators.required],
      location: ['', Validators.required],
      invoiceNumber: [''],
      notes: ['']
    });

    // Calculate total cost when quantity or cost per unit changes
    this.onChanges();
  }

  ngOnInit(): void {
    this.loading = true;
    // Set today's date as default if adding
    if (!this.isEditMode) {
      const today = new Date();
      const formatted = this.formatDateForInput(today);
      this.fuelForm.patchValue({ date: formatted });
      // If connected as driver, set driver field to current user
      const currentUser = this.authService.currentUserValue;
      if (currentUser && currentUser.role === 'driver') {
        this.fuelForm.patchValue({ driver: currentUser._id });
      }
    }
    this.missionService.getMissions().subscribe({
      next: (missions) => {
        // Filter missions for driver role
        const currentUser = this.authService.currentUserValue;
        if (currentUser && currentUser.role === 'driver') {
          this.missions = missions.filter(m => m.driver && m.driver.user && m.driver.user._id === currentUser._id);
        } else {
          this.missions = missions;
        }
        console.log('Missions loaded:', this.missions);
        // Collect all unique drivers from missions for dropdown (if needed elsewhere)
        this.drivers = Array.from(new Map(this.missions.map(m => [m.driver?._id, m.driver])).values()).filter(d => d && d._id);
        this.route.paramMap.subscribe(params => {
          const idParam = params.get('id');
          if (idParam) {
            this.recordId = idParam;
            this.isEditMode = true;
            this.loadFuelRecord(this.recordId);
          } else {
            this.loading = false;
          }
        });
        // Listen for mission changes to auto-select driver
        this.fuelForm.get('mission')?.valueChanges.subscribe(missionId => {
          const mission = this.missions.find(m => m._id === missionId);
          if (mission && mission.driver?._id) {
            this.fuelForm.patchValue({ driver: mission.driver._id });
          } else {
            this.fuelForm.patchValue({ driver: null });
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load missions.';
        this.loading = false;
      }
    });
  }

  onChanges(): void {
    // Recalculate total cost when quantity or cost per unit changes
    this.fuelForm.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateCost();
    });

    this.fuelForm.get('cost')?.valueChanges.subscribe(() => {
      this.calculateCost();
    });
  }

  calculateCost(): void {
    const quantity = this.fuelForm.get('quantity')?.value || 0;
    const cost = this.fuelForm.get('cost')?.value || 0;
    // No derived field, but could add total if needed
  }

  loadFuelRecord(id: string): void {
    this.loading = true;
    this.error = null;

    this.fuelService.getFuelRecord(id).subscribe({
      next: (record) => {
        if (record) {
          // Format date before patching the form
          console.log('Loaded fuel record:', record);
          const formattedDate = this.formatDateForInput(record.date ?? new Date());
          this.fuelForm.patchValue({
            ...record,
            mission: record.mission?._id || null,
            driver: record.mission?.driver?._id || null,
            date: formattedDate
          });
        } else {
          this.error = 'Fuel record not found';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load fuel record details. Please try again.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.fuelForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.fuelForm.controls).forEach(key => {
        const control = this.fuelForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValues = this.fuelForm.value;
    // Convert string date to Date object
    const fuelRecordData = {
      ...formValues,
      date: new Date(formValues.date),
      quantity: parseFloat(formValues.quantity),
      cost: parseFloat(formValues.cost),
    
    };

    if (this.isEditMode && this.recordId) {
      // Update existing fuel record
      this.fuelService.updateFuelRecord(this.recordId, fuelRecordData).subscribe({
        next: (record) => {
          this.submitting = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Fuel record successfully updated!',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/fuel']);
          });
        },
        error: (err: HttpErrorResponse) => {
          this.error = 'Failed to update fuel record. Please try again.';
          this.submitting = false;
        }
      });
    } else {
      // Create new fuel record
      this.fuelService.addFuelRecord(fuelRecordData).subscribe({
        next: (record) => {
          this.submitting = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Fuel record successfully added!',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/fuel']);
          });
        },
        error: (err: HttpErrorResponse) => {
          this.error = 'Failed to add fuel record. Please try again.';
          this.submitting = false;
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.recordId) {
      this.router.navigate(['/fuel', this.recordId]);
    } else {
      this.router.navigate(['/fuel']);
    }
  }

  // Utility method for date formatting
  private formatDateForInput(date: Date | string): string {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Form controls getters for template access
  get dateControl() { return this.fuelForm.get('date'); }
  get missionControl() { return this.fuelForm.get('mission'); }
  get fuelTypeControl() { return this.fuelForm.get('fuelType'); }
  get quantityControl() { return this.fuelForm.get('quantity'); }
  get costControl() { return this.fuelForm.get('cost'); }
  get odometerControl() { return this.fuelForm.get('odometer'); }
  get stationControl() { return this.fuelForm.get('station'); }
  get locationControl() { return this.fuelForm.get('location'); }
  get invoiceNumberControl() { return this.fuelForm.get('invoiceNumber'); }
  get notesControl() { return this.fuelForm.get('notes'); }
  get selectedMission(): Mission | undefined {
    const missionId = this.fuelForm.get('mission')?.value;
    return this.missions.find(m => m._id === missionId);
  }
  get selectedDriverName(): string {
    // If connected as driver, show their name
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.role === 'driver') {
      return currentUser.name + (currentUser.lastname ? ' ' + currentUser.lastname : '');
    }
    // Otherwise, show the driver of the selected mission
    const mission = this.selectedMission;
    return mission && mission.driver && mission.driver.user ? (mission.driver.user.name + (mission.driver.user.lastname ? ' ' + mission.driver.user.lastname : '')) : '';
  }
}
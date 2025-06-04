import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Driver } from '../../../shared/models/driver.model';
import { DriverService } from '../../../shared/services/driver.service';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';

@Component({
  standalone: false,
  selector: 'app-driver-form',
  templateUrl: './driver-form.component.html',
  styleUrls: ['./driver-form.component.scss']
})
export class DriverFormComponent implements OnInit {
  driverForm: FormGroup;
  driverId: any | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;
  error: string | null = null;
  
  statusOptions = ['Available', 'On Mission', 'On Leave', 'Inactive'];
  users: User[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private driverService: DriverService,
    private userService: UserService
  ) {
    this.driverForm = this.fb.group({
      user: ['', Validators.required],
      phone: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      licenseExpiry: ['', Validators.required],
      status: ['Available', Validators.required],
      experience: [0, [Validators.required, Validators.min(0)]],
      profileImage: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
       
        this.users = users.filter(u => u.role === 'driver' && u.DriverAccountActive === true);
        
      },
      error: (err) => {

      }
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.driverId = idParam;
        this.isEditMode = true;
        this.loadDriver(this.driverId);
      }
    });
  }

  loadDriver(id: number): void {
    this.loading = true;
    this.error = null;

    this.driverService.getDriver(id).subscribe({
      next: (driver) => {
        
        if (driver) {
          this.driverForm.patchValue({
            user: driver.user && typeof driver.user === 'object' ? driver.user._id : driver.user,
            phone: driver.phone,
            licenseNumber: driver.licenseNumber,
            licenseExpiry: this.formatDate(driver.licenseExpiry),
            status: driver.status,
            experience: driver.experience,
            profileImage: driver.profileImage,
            notes: driver.notes
          });
        } else {
          this.error = 'Driver not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading driver:', err);
        this.error = 'Failed to load driver details. Please try again.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.driverForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.driverForm.controls).forEach(key => {
        const control = this.driverForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValues = this.driverForm.value;
    const selectedUser = this.users.find(u => u._id === formValues.user);
    const driverData = {
      _id: this.isEditMode && this.driverId ? this.driverId : undefined,
      user: formValues.user,
      name: selectedUser?.name || '',
      email: selectedUser?.email || '',
      phone: formValues.phone,
      licenseNumber: formValues.licenseNumber,
      licenseExpiry: formValues.licenseExpiry,
      status: formValues.status,
      experience: formValues.experience,
      profileImage: formValues.profileImage,
      notes: formValues.notes
    };
     
    if (this.isEditMode && this.driverId) {
      this.driverService.updateDriver(driverData as Driver).subscribe({
        next: () => {
          this.router.navigate(['/drivers']);
        },
        error: (err) => {
          console.error('Error updating driver:', err);
          this.error = 'Failed to update driver.';
          this.submitting = false;
        }
      });
    } else {
      const { _id, ...driverDataWithoutId } = driverData;
      this.driverService.addDriver(driverDataWithoutId as any).subscribe({
        next: (driver:any) => {
          console.log('Driver added successfully:', driver.user);
          // Activate driver account for the user
          this.userService.setDriverAccountActive(driver.user).subscribe({
            next: () => {
              this.router.navigate(['/drivers']);
            },
            error: (err) => {
              console.error('Error activating driver account:', err);
              this.router.navigate(['/drivers']);
            }
          });
        },
        error: (err) => {
          console.error('Error adding driver:', err);
          this.error = 'Failed to add driver.';
          this.submitting = false;
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.driverId) {
      this.router.navigate(['/drivers', this.driverId]);
    } else {
      this.router.navigate(['/drivers']);
    }
  }

  // Utility methods for date formatting
  private formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getSelectedUserFullName(): string {
    const userId = this.driverForm.get('user')?.value;
    const user = this.users.find(u => u._id === userId);
    if (!user) return '';
    return user.name + (user.lastname ? ' ' + user.lastname : '');
  }

  // Form controls getters for template access
  get userControl() { return this.driverForm.get('user'); }
  get phoneControl() { return this.driverForm.get('phone'); }
  get licenseNumberControl() { return this.driverForm.get('licenseNumber'); }
  get licenseExpiryControl() { return this.driverForm.get('licenseExpiry'); }
  get statusControl() { return this.driverForm.get('status'); }
  get experienceControl() { return this.driverForm.get('experience'); }
  get profileImageControl() { return this.driverForm.get('profileImage'); }
  get notesControl() { return this.driverForm.get('notes'); }
}
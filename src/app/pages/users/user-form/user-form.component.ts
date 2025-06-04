import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../shared/models/user.model';
import { UserService } from '../../../shared/services/user.service';
import Swal from 'sweetalert2';

@Component({
  standalone: false,
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  userId: any = null;
  isEditMode = false;
  loading = false;
  submitting = false;
  error: string | null = null;

  // Form options
  roles = ['admin', 'park manager', 'user', 'driver'];
  statuses = ['active', 'inactive'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required]],
      confirmPassword: ['', this.isEditMode ? [] : [Validators.required]],
      role: ['user', [Validators.required]],
      status: ['inactive', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = id;
        this.isEditMode = this.router.url.includes('/edit/');
        // Remove validators for password fields in edit mode
        if (this.isEditMode) {
          this.userForm.get('password')?.clearValidators();
          this.userForm.get('password')?.updateValueAndValidity();
          this.userForm.get('confirmPassword')?.clearValidators();
          this.userForm.get('confirmPassword')?.updateValueAndValidity();
        }
        this.loadUser(this.userId);
      }
    });
  }

  loadUser(id: any): void {
    this.loading = true;
    this.error = null;

    this.userService.getUser(id).subscribe({
      next: (user) => {
        if (user) {
          this.userForm.patchValue({
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            status: user.statuts_account
          });
        } else {
          this.error = 'User not found';
          this.router.navigate(['/users']);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.error = 'Failed to load user details. Please try again.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      // Mark all form controls as touched to trigger validation messages
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = null;

    if (this.isEditMode && this.userId) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to save the changes?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, save it!'
      }).then((result) => {
        if (result.isConfirmed) {
          const now = new Date();
          const updatedUser: User = {
            _id: this.userId ? this.userId.toString() : '',
            name: this.userForm.value.name,
            lastname: this.userForm.value.lastname,
            email: this.userForm.value.email,
            role: this.userForm.value.role,
            statuts_account: this.userForm.value.status,
            createdAt: now,
            updatedAt: now
          };

          this.userService.updateUser(updatedUser).subscribe({
            next: () => {
              Swal.fire('Success', 'User successfully updated!', 'success').then(() => {
                this.router.navigate(['/users']);
              });
            },
            error: (err) => {
              console.error('Error updating user:', err);
              this.error = 'Failed to update user. Please try again.';
              this.submitting = false;
            }
          });
        } else {
          this.submitting = false;
        }
      });
    } else {
      // Create new user
      if (this.userForm.value.password !== this.userForm.value.confirmPassword) {
        this.error = 'Passwords do not match';
        this.submitting = false;
        return;
      }
      this.userService.addUser({
        name: this.userForm.value.name,
        lastname: this.userForm.value.lastname,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        role: this.userForm.value.role,
        statuts_account: this.userForm.value.status
      }).subscribe({
        next: (newUser) => {
          Swal.fire('Success', 'User added successfully!', 'success').then(() => {
            this.router.navigate(['/users']);
          });
        },
        error: (err) => {
          console.error('Error creating user:', err);
          this.error = 'Failed to create user. Please try again.';
          this.submitting = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }

  // Getters for form controls to use in template for validation
  get nameControl() { return this.userForm.get('name'); }
  get lastnameControl() { return this.userForm.get('lastname'); }
  get emailControl() { return this.userForm.get('email'); }
  get passwordControl() { return this.userForm.get('password'); }
  get confirmPasswordControl() { return this.userForm.get('confirmPassword'); }
  get roleControl() { return this.userForm.get('role'); }
  get statusControl() { return this.userForm.get('status'); }
}
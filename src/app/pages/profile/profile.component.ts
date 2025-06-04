import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  // imports: [CommonModule, ReactiveFormsModule]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  submitting = false;
  passwordSubmitting = false;
  success: string | null = null;
  passwordSuccess: string | null = null;
  error: string | null = null;
  passwordError: string | null = null;
  user: User | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.profileForm = this.fb.group({
      name: ['John Doe', [Validators.required]],
      lastname: ['John Doe', [Validators.required]],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      role: ['Admin', [Validators.required]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name ,
        lastname: this.user.lastname,
        email: this.user.email,
        role: this.user.role.charAt(0).toUpperCase() + this.user.role.slice(1)
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }
    
    this.submitting = true;
    this.success = null;
    this.error = null;
    
    // Simulate API call
    setTimeout(() => {
      // In a real app this would call an API endpoint
      console.log('Profile updated:', this.profileForm.value);
      this.success = 'Profile updated successfully!';
      this.submitting = false;
    }, 1000);
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    
    this.passwordSubmitting = true;
    this.passwordSuccess = null;
    this.passwordError = null;
    
    // Simulate API call
    setTimeout(() => {
      // In a real app this would call an API endpoint
      console.log('Password updated');
      this.passwordSuccess = 'Password updated successfully!';
      this.passwordForm.reset();
      this.passwordSubmitting = false;
    }, 1000);
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signupForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });

    // // Redirect to dashboard if already logged in
    // if (this.authService.isLoggedIn) {
    //   this.router.navigate(['/dashboard']);
    // }
  }

  ngOnInit(): void {
    // Initialize component
  }

  // Convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.signup({
      name: this.f['name'].value,
      lastname: '', // Add lastname if you want to collect it from the form
      email: this.f['email'].value,
      password: this.f['password'].value
    }).subscribe({
      next: response => {
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      },
      error: error => {
        this.error = error.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  // Custom validator to check if passwords match
  private passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password === confirmPassword) {
      return null;
    }

    return { passwordMismatch: true };
  }
}
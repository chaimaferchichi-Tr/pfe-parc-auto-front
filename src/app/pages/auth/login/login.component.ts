import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  redirectUrl: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Redirect to dashboard if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/dashboard'
    this.redirectUrl = this.route.snapshot.queryParams['redirectUrl'] || '/dashboard';
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({
      email: this.f['email'].value,
      password: this.f['password'].value
    }).subscribe({
      next: () => {
        this.router.navigate([this.redirectUrl]);
      },
      error: error => {
        this.error = error.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }

  onDemo(role: string): void {
    this.loading = true;
    this.error = '';
    
    let email: string;
    let password: string;
    
    switch (role) {
      case 'admin':
        email = 'admin@example.com';
        password = 'admin123';
        break;
      case 'manager':
        email = 'manager@example.com';
        password = 'manager123';
        break;
      case 'user':
      default:
        email = 'user@example.com';
        password = 'user123';
        break;
    }
    
    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate([this.redirectUrl]);
      },
      error: error => {
        this.error = error.message || 'Demo login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
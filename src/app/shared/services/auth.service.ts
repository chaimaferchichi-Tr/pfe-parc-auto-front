import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, LoginRequest, SignupRequest, AuthResponse } from '../models/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  // Demo users for testing without backend
  private demoUsers = [
   
  ];

  constructor(private http: HttpClient) {
    // Check if user data exists in localStorage and parse it
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Get the current user value from the behavior subject
  public get currentUserValue(): User | null {
    console.log("Current user value: ", this.currentUserSubject.value);
    return this.currentUserSubject.value;
  }

  // Check if user is logged in
  public get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  // Login method
  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`https://backend-parc.onrender.com/User/login`, credentials)
      .pipe(
        map((response: AuthResponse) => {
          if (response.user.statuts_account === 'inactive') {
            // Show SweetAlert2 and throw error
            import('sweetalert2').then(Swal => {
              Swal.default.fire({
                icon: 'error',
                title: 'Account Inactive',
                text: 'You cannot log in. Your account is inactive. Please contact your manager.',
                confirmButtonColor: '#d33'
              });
            });
            throw new Error('Account inactive');
          }
          // Store the full user object and jwt token in local storage
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
          return response.user;
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Login failed'));
        })
      );
  }

  // Signup method
  signup(userData: SignupRequest): Observable<User> {
    return this.http.post<AuthResponse>(`https://backend-parc.onrender.com//User/register`, userData)
      .pipe(
        map(response => {
          // Store user details and jwt token in local storage
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
          return response.user;
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Registration failed'));
        })
      );
  }

  // Logout method
  logout(): void {
    // Remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    
 
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    if (!this.currentUserValue) {
      return throwError(() => new Error('User not logged in'));
    }

    // Merge current user data with updated data
    const updatedUser = {
      ...this.currentUserValue,
      ...userData,
      updatedAt: new Date()
    };
    
    // Update stored user and currentUserSubject
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
    return of(updatedUser);
    

  }

  // Get authenticated user's profile
  getProfile(): Observable<User> {
    if (!this.currentUserValue) {
      return throwError(() => new Error('User not logged in'));
    }
    
    return of(this.currentUserValue);
    

  }

  // Filter missions for the current driver
  getDriverMissions(allMissions: any[]): any[] {
    const user = this.currentUserValue;
    if (!user || user.role !== 'driver') return [];
    return allMissions.filter(mission => mission.driver && mission.driver.user && mission.driver.user._id === user._id);
  }

}
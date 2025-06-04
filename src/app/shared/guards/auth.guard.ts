import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn) {
      return true;
    }
    
    // Store the attempted URL for redirecting after login
    const redirectUrl = state.url === '/' ? '/dashboard' : state.url;
    this.router.navigate(['/auth/login'], { queryParams: { redirectUrl } });
    return false;
  }
}
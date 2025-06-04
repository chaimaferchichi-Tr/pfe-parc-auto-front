import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent {
  @Input() isSidebarOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  userMenuOpen = false;
  isDarkMode = false;
  userName: string = '';

  constructor(private themeService: ThemeService, public authService: AuthService, private router: Router) {
    this.isDarkMode = this.themeService.isDarkMode();
    this.setUserName();
  }

  ngOnInit(): void {
    this.setUserName();
    this.authService.currentUser.subscribe(user => {
      if (user) {
        if (typeof user === 'string') {
          this.userName = user;
        } else if (user.name && user.lastname) {
          this.userName = user.name + ' ' + user.lastname;
        } else if (user.name) {
          this.userName = user.name;
        }
      } else {
        this.setUserName();
      }
    });
  }

  setUserName() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (typeof parsed === 'string') {
          this.userName = parsed;
        } else if (parsed.name && parsed.lastname) {
          this.userName = parsed.name + ' ' + parsed.lastname;
        } else if (parsed.name) {
          this.userName = parsed.name;
        } else {
          this.userName = '';
        }
      } catch {
        this.userName = storedUser;
      }
    } else {
      this.userName = '';
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

  navigateToProfile(): void {
    this.userMenuOpen = false;
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = false;
  private readonly STORAGE_KEY = 'darkMode';

  constructor() {}

  initTheme(): void {
    // Check if user has a preference saved in local storage
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    if (savedTheme !== null) {
      this.darkMode = JSON.parse(savedTheme);
    } else {
      // Check if user has a system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkMode = prefersDark;
    }
    
    this.applyTheme();
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }

  setDarkMode(isDark: boolean): void {
    this.darkMode = isDark;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(isDark));
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
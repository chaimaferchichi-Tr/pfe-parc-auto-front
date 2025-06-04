import { Component, OnInit, HostListener } from '@angular/core';
import { ThemeService } from './shared/services/theme.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'Fleet Management System';
  isSidebarOpen = true;
  isAuthPage = false;
  showChatbot = false;

  constructor(
    private themeService: ThemeService,
    private router: Router,
    private authService: AuthService
  ) {
    // Listen to route changes to update isAuthPage
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects || event.url;
        this.isAuthPage = url.startsWith('/auth') || url.startsWith('/login') || url.startsWith('/signup');
      }
    });
  }

  ngOnInit(): void {
    this.themeService.initTheme();
    this.checkViewportSize();
    this.updateChatbotVisibility();

    // Redirect driver to missions after login
    const user = this.authService.currentUserValue;
    if (user && user.role === 'driver' && this.router.url === '/dashboard') {
      this.router.navigate(['/missions']);
    }

    // Subscribe to router events to detect when we're on auth pages
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthPage = event.url.includes('/auth');
      this.updateChatbotVisibility();
      // Redirect driver to missions if they try to access dashboard
      const user = this.authService.currentUserValue;
      if (user && user.role === 'driver' && event.url === '/dashboard') {
        this.router.navigate(['/missions']);
      }
    });
    
    // Check initial route
    this.isAuthPage = this.router.url.includes('/auth');
    this.updateChatbotVisibility();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  @HostListener('window:resize')
  private checkViewportSize(): void {
    // Only auto-open the sidebar if we're not on an auth page
    if (!this.isAuthPage) {
      this.isSidebarOpen = window.innerWidth >= 1024; // 1024px is lg breakpoint in Tailwind
    }
  }

  updateChatbotVisibility() {
    const user = this.authService.currentUserValue;
    this.showChatbot =
      !!user && (user.role === 'admin' || user.role === 'park manager') && !this.isAuthPage;
    if (this.showChatbot) {
      // Dynamically load chatbot script if not already loaded
      if (!document.getElementById('n8n-chatbot')) {
        const script = document.createElement('script');
        script.type = 'module';
        script.id = 'n8n-chatbot';
        script.innerHTML = `import { createChat } from "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js";\ncreateChat({ webhookUrl: \"http://localhost:5678/webhook/e6ab8aa7-445a-4806-b278-40d57a33dfa2/chat\" });`;
        document.body.appendChild(script);
      }
    } else {
      // Remove chatbot if present
      const script = document.getElementById('n8n-chatbot');
      if (script) script.remove();
      // Remove chat widget if present
      const chatWidget = document.querySelector('n8n-chat');
      if (chatWidget) chatWidget.remove();
    }
  }
}
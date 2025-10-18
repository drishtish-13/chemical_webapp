import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Chemical Compounds App';
  showNavbar = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Listen to route changes to show/hide navbar and sidebar
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.updateLayout((event as NavigationEnd).url);
      });

    // Check initial route
    this.updateLayout(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateLayout(url: string): void {
    const isAuthRoute = url.includes('/login') || url.includes('/signup') || 
                       url.includes('/forgot-password') || url.includes('/reset-password');
    
    this.showNavbar = !isAuthRoute && this.authService.isAuthenticated();
  }
}

import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthStateService } from './core/auth/auth-state.service';
import { PhButtonComponent } from './ui/button/button.component';
import { PhToolbarComponent } from './ui/toolbar/toolbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PhButtonComponent, PhToolbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly auth = inject(AuthStateService);

  private readonly router = inject(Router);
  private readonly navigationEnd = toSignal(
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)),
    { initialValue: null }
  );

  protected readonly showShell = computed(() => {
    this.navigationEnd();

    return this.auth.authenticated() && !this.router.url.startsWith('/login');
  });

  protected logout(): void {
    void this.auth.logout();
  }
}

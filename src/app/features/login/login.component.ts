import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthStateService } from '../../core/auth/auth-state.service';
import { PhButtonComponent } from '../../ui/button/button.component';
import { PhMessageComponent } from '../../ui/message/message.component';

@Component({
  selector: 'app-login',
  imports: [PhButtonComponent, PhMessageComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly auth = inject(AuthStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly signingIn = signal(false);
  protected readonly loginError = signal<string | null>(null);
  protected readonly errorMessage = computed(() => this.loginError());

  constructor() {
    if (this.auth.authenticated()) {
      void this.router.navigateByUrl(this.returnUrl());
    }
  }

  protected signIn(): void {
    this.signingIn.set(true);
    this.loginError.set(null);

    void this.auth.login(this.returnUrl()).catch(() => {
      this.signingIn.set(false);
      this.loginError.set("We couldn't start the sign-in flow. Try again, or contact your administrator if the problem persists.");
    });
  }

  private returnUrl(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl') ?? '/overview';
  }
}

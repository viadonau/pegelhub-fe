import { Component, input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'ph-loading',
  imports: [ProgressSpinnerModule],
  template: `
    <div class="ph-loading" role="status" aria-live="polite">
      <p-progress-spinner class="ph-loading-spinner" strokeWidth="4" ariaLabel="Loading" />
      <span>{{ label() }}</span>
    </div>
  `,
  styleUrl: './loading.component.scss'
})
export class PhLoadingComponent {
  readonly label = input('Loading');
}

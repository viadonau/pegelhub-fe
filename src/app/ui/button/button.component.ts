import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

export type PhButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

@Component({
  selector: 'ph-button',
  imports: [ButtonModule],
  host: {
    class: 'inline-flex'
  },
  template: `
    <p-button
      [label]="label()"
      [icon]="icon()"
      [loading]="loading()"
      [disabled]="disabled()"
      [severity]="severity()"
      [outlined]="variant() === 'secondary'"
      [text]="variant() === 'ghost'"
      (onClick)="clicked.emit($event)"
    />
  `
})
export class PhButtonComponent {
  readonly label = input.required<string>();
  readonly variant = input<PhButtonVariant>('primary');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly icon = input<string>();
  readonly clicked = output<MouseEvent>();

  protected readonly severity = computed(() => {
    if (this.variant() === 'danger') {
      return 'danger';
    }

    if (this.variant() === 'secondary' || this.variant() === 'ghost') {
      return 'secondary';
    }

    return 'primary';
  });
}

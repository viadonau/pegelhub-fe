import { Component, input } from '@angular/core';

@Component({
  selector: 'ph-display-item',
  host: {
    class: 'ph-display-item',
    '[class.ph-display-item-strong]': 'strong()',
  },
  template: `
    <span class="ph-display-item-label">{{ label() }}</span>
    <span class="ph-display-item-value">{{ value() }}</span>
  `,
  styleUrl: './display-item.component.scss',
})
export class PhDisplayItemComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly strong = input(false);
}

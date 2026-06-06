import { Component, input } from '@angular/core';

export interface PhStationMetaItem {
  label: string;
  value: string;
  strong?: boolean;
}

@Component({
  selector: 'ph-station-meta',
  template: `
    <dl class="ph-station-meta" aria-label="Station metadata">
      @for (item of items(); track item.label) {
        <div class="ph-station-meta-item" [class.ph-station-meta-item-strong]="item.strong">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </div>
      }
    </dl>
  `,
  styleUrl: './station-meta.component.scss',
})
export class PhStationMetaComponent {
  readonly items = input.required<readonly PhStationMetaItem[]>();
}

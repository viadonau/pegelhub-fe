import { Component, input } from '@angular/core';

export interface PhStationMetaItem {
  label: string;
  value: string;
  strong?: boolean;
}

@Component({
  selector: 'div[ph-station-meta-item]',
  host: {
    class: 'ph-station-meta-item',
    '[class.ph-station-meta-item-strong]': 'item().strong',
  },
  template: `
    <dt>{{ item().label }}</dt>
    <dd>{{ item().value }}</dd>
  `,
  styleUrl: './station-meta.component.scss',
})
export class PhStationMetaItemComponent {
  readonly item = input.required<PhStationMetaItem>();
}

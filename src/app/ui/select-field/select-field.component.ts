import { Component, input, output } from '@angular/core';

export interface PhSelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'ph-select-field',
  host: {
    class: 'block',
  },
  template: `
    <label class="ph-select-field">
      <span>{{ label() }}</span>
      <select
        class="ph-select-field-control"
        [attr.aria-label]="ariaLabel() ?? label()"
        [value]="value()"
        [disabled]="disabled()"
        (change)="selectValue($event)"
      >
        @for (option of options(); track option.value) {
          <option [value]="option.value" [selected]="option.value === value()">
            {{ option.label }}
          </option>
        }
      </select>
    </label>
  `,
  styleUrl: './select-field.component.scss',
})
export class PhSelectFieldComponent {
  readonly label = input.required<string>();
  readonly options = input.required<readonly PhSelectOption[]>();
  readonly value = input.required<string>();
  readonly ariaLabel = input<string>();
  readonly disabled = input(false);
  readonly valueChange = output<string>();

  protected selectValue(event: Event): void {
    this.valueChange.emit((event.target as HTMLSelectElement).value);
  }
}

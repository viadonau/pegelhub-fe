import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ph-search-field',
  host: {
    class: 'block',
  },
  template: `
    <div class="ph-search-field">
      <i class="pi pi-search" aria-hidden="true"></i>
      <input
        type="search"
        [attr.aria-label]="label()"
        autocomplete="off"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        (input)="updateValue($event)"
      />
      @if (value()) {
        <button
          type="button"
          [attr.aria-label]="clearLabel()"
          [disabled]="disabled()"
          (click)="clearValue()"
        >
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      }
    </div>
  `,
  styleUrl: './search-field.component.scss',
})
export class PhSearchFieldComponent {
  readonly label = input('Search');
  readonly placeholder = input('Search');
  readonly clearLabel = input('Clear search');
  readonly value = input('');
  readonly disabled = input(false);
  readonly valueChange = output<string>();

  protected updateValue(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }

  protected clearValue(): void {
    this.valueChange.emit('');
  }
}

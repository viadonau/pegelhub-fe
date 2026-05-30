import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

export interface PhTableColumn {
  field: string;
  header: string;
}

type PhTableRow = object;

@Component({
  selector: 'ph-table',
  imports: [ButtonModule, TableModule],
  host: {
    class: 'block overflow-x-auto'
  },
  template: `
    <p-table [value]="rows()" [loading]="loading()" [tableStyle]="{ 'min-width': '48rem' }">
      <ng-template #header>
        <tr>
          @for (column of columns(); track column.field) {
            <th>{{ column.header }}</th>
          }
          @if (actionLabel()) {
            <th class="ph-table-action-column"></th>
          }
        </tr>
      </ng-template>

      <ng-template #body let-row>
        <tr>
          @for (column of columns(); track column.field) {
            <td>{{ cell(row, column.field) }}</td>
          }
          @if (actionLabel()) {
            <td class="ph-table-action-column">
              <p-button
                [label]="actionLabel()"
                [icon]="actionIcon()"
                severity="secondary"
                [outlined]="true"
                size="small"
                (onClick)="rowAction.emit(row)"
              />
            </td>
          }
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns().length + (actionLabel() ? 1 : 0)">{{ emptyMessage() }}</td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styleUrl: './table.component.scss'
})
export class PhTableComponent {
  readonly rows = input<PhTableRow[]>([]);
  readonly columns = input<PhTableColumn[]>([]);
  readonly emptyMessage = input('No rows found.');
  readonly loading = input(false);
  readonly actionLabel = input<string>();
  readonly actionIcon = input<string>();
  readonly rowAction = output<PhTableRow>();

  protected cell(row: PhTableRow, field: string): string {
    const value = (row as Record<string, unknown>)[field];
    return value === undefined || value === null || value === '' ? '-' : String(value);
  }
}

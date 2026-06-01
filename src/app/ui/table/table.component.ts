import { Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';

export interface PhTableColumn {
  field: string;
  header: string;
  align?: 'start' | 'end';
  emphasis?: boolean;
}

type PhTableRow = object;

@Component({
  selector: 'ph-table',
  imports: [TableModule],
  host: {
    class: 'block overflow-x-auto'
  },
  template: `
    <p-table
      [value]="rows()"
      [loading]="loading()"
      [tableStyle]="{ 'min-width': minWidth() }"
      [paginator]="paginator()"
      [rows]="pageSize()"
      [rowsPerPageOptions]="rowsPerPageOptions()"
      [showCurrentPageReport]="paginator()"
      currentPageReportTemplate="{first}–{last} of {totalRecords}"
    >
      <ng-template #header>
        <tr>
          @for (column of columns(); track column.field) {
            <th scope="col" [class.ph-cell-end]="column.align === 'end'">{{ column.header }}</th>
          }
          @if (clickable()) {
            <th class="ph-table-action-column" scope="col">
              <span class="ph-visually-hidden">Action</span>
            </th>
          }
        </tr>
      </ng-template>

      <ng-template #body let-row>
        <tr
          [class.ph-row-clickable]="clickable()"
          [attr.tabindex]="clickable() ? 0 : null"
          [attr.role]="clickable() ? 'button' : null"
          [attr.aria-label]="clickable() ? (actionLabel() || 'Open') + ': ' + primarySummary(row) : null"
          (click)="clickable() && rowAction.emit(row)"
          (keydown.enter)="clickable() && rowAction.emit(row)"
          (keydown.space)="clickable() && handleSpace($event, row)"
        >
          @for (column of columns(); track column.field) {
            <td
              [class.ph-cell-end]="column.align === 'end'"
              [class.ph-cell-emphasis]="column.emphasis"
            >
              {{ cell(row, column.field) }}
            </td>
          }
          @if (clickable()) {
            <td class="ph-table-action-column" aria-hidden="true">
              <i class="pi pi-chevron-right ph-row-chevron"></i>
            </td>
          }
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td
            class="ph-table-empty"
            [attr.colspan]="columns().length + (clickable() ? 1 : 0)"
          >
            {{ emptyMessage() }}
          </td>
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
  readonly clickable = input(false);
  readonly actionLabel = input<string>();
  readonly paginator = input(false);
  readonly pageSize = input(20);
  readonly rowsPerPageOptions = input<number[]>([20, 50, 100]);
  readonly minWidth = input('100%');
  readonly rowAction = output<PhTableRow>();

  protected cell(row: PhTableRow, field: string): string {
    const value = (row as Record<string, unknown>)[field];
    return value === undefined || value === null || value === '' ? '-' : String(value);
  }

  protected primarySummary(row: PhTableRow): string {
    const firstColumn = this.columns()[0];
    return firstColumn ? this.cell(row, firstColumn.field) : '';
  }

  protected handleSpace(event: Event, row: PhTableRow): void {
    event.preventDefault();
    this.rowAction.emit(row);
  }
}

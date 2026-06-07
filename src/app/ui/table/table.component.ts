import { Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';

export type PhTableColumnKind = 'text' | 'numeric' | 'parameters';

export interface PhTableInlineTag {
  field: string;
  hideWhen?: string;
}

export interface PhTableColumn {
  field: string;
  header: string;
  align?: 'start' | 'end';
  emphasis?: boolean;
  kind?: PhTableColumnKind;
  inlineTag?: PhTableInlineTag;
}

export interface PhTableParameter {
  code: string;
  label?: string;
}

type PhTableRow = object;

@Component({
  selector: 'ph-table',
  imports: [TableModule],
  host: {
    class: 'block overflow-x-auto',
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
            <th
              scope="col"
              [class.ph-cell-end]="column.align === 'end' || column.kind === 'numeric'"
              [class.ph-cell-numeric]="column.kind === 'numeric'"
            >
              {{ column.header }}
            </th>
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
          [attr.aria-label]="
            clickable() ? (actionLabel() || 'Open') + ': ' + primarySummary(row) : null
          "
          (click)="clickable() && rowAction.emit(row)"
          (keydown.enter)="clickable() && rowAction.emit(row)"
          (keydown.space)="clickable() && handleSpace($event, row)"
        >
          @for (column of columns(); track column.field) {
            <td
              [class.ph-cell-end]="column.align === 'end' || column.kind === 'numeric'"
              [class.ph-cell-emphasis]="column.emphasis"
              [class.ph-cell-numeric]="column.kind === 'numeric'"
              [class.ph-cell-parameters]="column.kind === 'parameters'"
            >
              @switch (column.kind) {
                @case ('parameters') {
                  @if (parameters(row, column.field); as params) {
                    @if (params.length > 0) {
                      <span class="ph-parameter-row">
                        @for (param of params; track param.code) {
                          <span class="ph-parameter-badge" [attr.title]="param.label || null">
                            {{ param.code }}
                          </span>
                        }
                      </span>
                    } @else {
                      <span class="ph-cell-empty" aria-hidden="true">—</span>
                    }
                  } @else {
                    <span class="ph-cell-empty" aria-hidden="true">—</span>
                  }
                }
                @default {
                  @if (column.emphasis && column.inlineTag; as tag) {
                    <span class="ph-cell-emphasis-row">
                      <span class="ph-cell-emphasis-text">{{ cell(row, column.field) }}</span>
                      @if (inlineTagValue(row, column.inlineTag); as tagValue) {
                        <span class="ph-inline-tag">{{ tagValue }}</span>
                      }
                    </span>
                  } @else {
                    {{ cell(row, column.field) }}
                  }
                }
              }
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
          <td class="ph-table-empty" [attr.colspan]="columns().length + (clickable() ? 1 : 0)">
            {{ emptyMessage() }}
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styleUrl: './table.component.scss',
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

  protected parameters(row: PhTableRow, field: string): PhTableParameter[] | null {
    const value = (row as Record<string, unknown>)[field];
    if (!Array.isArray(value)) return null;
    return value.filter(
      (entry): entry is PhTableParameter =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as { code?: unknown }).code === 'string',
    );
  }

  protected inlineTagValue(row: PhTableRow, tag: PhTableInlineTag): string | null {
    const raw = (row as Record<string, unknown>)[tag.field];
    if (raw === undefined || raw === null || raw === '') return null;
    const value = String(raw);
    if (tag.hideWhen !== undefined && value === tag.hideWhen) return null;
    return value;
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

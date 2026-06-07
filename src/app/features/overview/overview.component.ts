import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { SupplierApiService } from '../../core/api/supplier-api.service';
import { describeParameter } from '../../core/station/parameter-legend';
import { PhButtonComponent } from '../../ui/button/button.component';
import { PhLoadingComponent } from '../../ui/loading/loading.component';
import { PhMessageComponent } from '../../ui/message/message.component';
import { PhSearchFieldComponent } from '../../ui/search-field/search-field.component';
import { PhTableColumn, PhTableComponent } from '../../ui/table/table.component';
import { SupplierOverviewRow } from './supplier.dto';

const STATION_COLUMNS: PhTableColumn[] = [
  {
    field: 'stationName',
    header: 'Station',
    emphasis: true,
    inlineTag: { field: 'owner', hideWhen: 'via' },
  },
  { field: 'stationWater', header: 'Water' },
  { field: 'riverKm', header: 'km', kind: 'numeric' },
  { field: 'parameters', header: 'Parameters', kind: 'parameters' },
  { field: 'stationNumber', header: 'Station number' },
];

const kmFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const relativeTimeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const absoluteTimeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });

@Component({
  selector: 'app-overview',
  imports: [
    PhButtonComponent,
    PhLoadingComponent,
    PhMessageComponent,
    PhSearchFieldComponent,
    PhTableComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  private readonly data = inject(SupplierApiService);
  private readonly router = inject(Router);

  protected readonly suppliers = this.data.suppliersResource();
  protected readonly columns = STATION_COLUMNS;
  protected readonly stationFilter = signal('');
  protected readonly lastSync = signal<Date | null>(null);
  private readonly nowTick = signal(Date.now());

  constructor() {
    effect(() => {
      if (this.suppliers.status() === 'resolved' && !this.suppliers.isLoading()) {
        this.lastSync.set(new Date());
      }
    });

    const destroyRef = inject(DestroyRef);
    const interval = setInterval(() => this.nowTick.set(Date.now()), 30_000);
    destroyRef.onDestroy(() => clearInterval(interval));
  }

  protected readonly rows = computed<SupplierOverviewRow[]>(() =>
    this.suppliers.value().map((supplier) => ({
      id: supplier.id,
      stationNumber: supplier.stationNumber,
      stationName: supplier.stationName,
      stationWater: supplier.stationWater,
      riverKm: supplier.riverKm !== undefined ? kmFormatter.format(supplier.riverKm) : undefined,
      parameters: supplier.parameters?.map((code) => ({
        code,
        label: describeParameter(code)
          ? `${describeParameter(code)!.label} · ${describeParameter(code)!.unit}`
          : undefined,
      })),
      owner: supplier.owner,
    })),
  );
  protected readonly filteredRows = computed(() => {
    const query = normalizeStationValue(this.stationFilter());

    if (!query) {
      return this.rows();
    }

    return this.rows().filter((row) =>
      [row.stationName, row.stationWater, row.stationNumber].some((value) =>
        normalizeStationValue(value).includes(query),
      ),
    );
  });
  protected readonly stationCount = computed(() => this.rows().length);
  protected readonly filteredStationCount = computed(() => this.filteredRows().length);
  protected readonly stationCountLabel = computed(() => {
    const count = this.stationCount();

    return count === 1 ? '1 station' : `${count} stations`;
  });
  protected readonly overviewStatusLabel = computed(() => {
    if (this.suppliers.isLoading()) {
      return this.stationCount() === 0 ? 'Loading' : 'Refreshing';
    }

    return this.errorMessage() ? 'Needs attention' : 'Ready';
  });
  protected readonly lastSyncLabel = computed(() => {
    const synced = this.lastSync();
    if (!synced) {
      return this.suppliers.isLoading() ? 'syncing…' : 'not yet';
    }

    const ageMs = this.nowTick() - synced.getTime();
    const ageSec = Math.max(0, Math.round(ageMs / 1000));

    if (ageSec < 60) {
      return 'just now';
    }

    const ageMin = Math.round(ageSec / 60);

    if (ageMin < 60) {
      return relativeTimeFormatter.format(-ageMin, 'minute');
    }

    return absoluteTimeFormatter.format(synced);
  });
  protected readonly filterSummary = computed(() => {
    if (this.stationFilter().trim()) {
      return `${this.filteredStationCount()} of ${this.stationCountLabel()} shown`;
    }

    return '';
  });
  protected readonly emptyMessage = computed(() =>
    this.stationFilter().trim()
      ? 'No stations match the current filter.'
      : 'No stations to show. Your account might not have access to any yet.',
  );
  protected readonly errorMessage = computed(() => {
    if (this.suppliers.status() !== 'error') {
      return null;
    }

    const status = this.suppliers.statusCode() ?? extractStatus(this.suppliers.error());

    if (status === 401) {
      return 'Your session has expired. Please sign in again to continue.';
    }

    if (status === 403) {
      return "You don't have access to station data. Ask an administrator to grant the metadata:read role.";
    }

    return "We couldn't load the stations right now. Try again, or check that the data service is reachable.";
  });

  protected openSupplier(row: object): void {
    const stationNumber = (row as SupplierOverviewRow).stationNumber;

    void this.router.navigate(['/overview', stationNumber]);
  }

  protected setStationFilter(value: string): void {
    this.stationFilter.set(value);
  }
}

function extractStatus(error: Error | undefined): number | undefined {
  const status = (error as unknown as { status?: unknown } | undefined)?.status;

  return typeof status === 'number' ? status : undefined;
}

function normalizeStationValue(value: string): string {
  return value.trim().toLocaleLowerCase();
}

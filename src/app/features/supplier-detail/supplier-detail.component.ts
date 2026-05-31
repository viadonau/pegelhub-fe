import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { MeasurementDto } from '../../core/api/measurement.dto';
import { MeasurementApiService } from '../../core/api/measurement-api.service';
import { SupplierApiService } from '../../core/api/supplier-api.service';
import { PhButtonComponent } from '../../ui/button/button.component';
import { PhLineChartComponent, PhChartSeries } from '../../ui/chart/line-chart.component';
import { PhLoadingComponent } from '../../ui/loading/loading.component';
import { PhMessageComponent } from '../../ui/message/message.component';
import { PhTableColumn, PhTableComponent } from '../../ui/table/table.component';
import { MEASUREMENT_RANGES } from './measurement-range';

interface MeasurementTableRow {
  timestamp: string;
  value: string;
}

const MEASUREMENT_COLUMNS: PhTableColumn[] = [
  { field: 'timestamp', header: 'Timestamp' },
  { field: 'value', header: 'Reading', align: 'end' }
];

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'medium'
});

const compactTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});

@Component({
  selector: 'app-supplier-detail',
  imports: [
    FormsModule,
    RouterLink,
    PhButtonComponent,
    PhLineChartComponent,
    PhLoadingComponent,
    PhMessageComponent,
    PhTableComponent
  ],
  templateUrl: './supplier-detail.component.html',
  styleUrl: './supplier-detail.component.scss'
})
export class SupplierDetailComponent {
  readonly stationNumber = input('');

  private readonly suppliersApi = inject(SupplierApiService);
  private readonly measurementsApi = inject(MeasurementApiService);
  private readonly titleService = inject(Title);

  protected readonly ranges = MEASUREMENT_RANGES;
  protected readonly selectedRange = signal(MEASUREMENT_RANGES[1].value);
  protected readonly selectedField = signal<string | null>(null);

  protected readonly suppliers = this.suppliersApi.suppliersResource();
  protected readonly measurements = this.measurementsApi.measurementsBySupplierResource(this.stationNumber, this.selectedRange);
  protected readonly columns = MEASUREMENT_COLUMNS;

  protected readonly supplier = computed(() =>
    this.suppliers.value().find((supplier) => supplier.stationNumber === this.stationNumber())
  );

  constructor() {
    effect(() => {
      const name = this.supplier()?.stationName ?? this.stationNumber();
      this.titleService.setTitle(name ? `${name} · PegelHub` : 'Station · PegelHub');
    });
  }

  protected readonly fieldNames = computed(() => {
    const names = new Set<string>();

    for (const measurement of this.measurements.value()) {
      for (const fieldName of Object.keys(measurement.fields ?? {})) {
        names.add(fieldName);
      }
    }

    return [...names].sort();
  });

  protected humanizeField(field: string): string {
    return humanizeFieldName(field);
  }

  protected readonly activeField = computed(() => {
    const selectedField = this.selectedField();
    const fieldNames = this.fieldNames();

    if (selectedField && fieldNames.includes(selectedField)) {
      return selectedField;
    }

    return fieldNames[0] ?? null;
  });
  protected readonly activeFieldValue = computed(() => this.activeField() ?? '');
  protected readonly chartYLabel = computed(() => {
    const field = this.activeField();
    if (!field) return undefined;
    const unit = this.activeUnit();
    const label = humanizeFieldName(field);
    return unit ? `${label} (${unit})` : label;
  });
  protected readonly selectedRangeLabel = computed(
    () => MEASUREMENT_RANGES.find((range) => range.value === this.selectedRange())?.label ?? ''
  );

  protected readonly activeUnit = computed<string | null>(() => {
    const measurements = this.measurements.value();
    for (const measurement of measurements) {
      const unit = measurement.infos?.['unit'];
      if (typeof unit === 'string' && unit.length > 0) return unit;
    }
    return null;
  });

  protected readonly stationLocation = computed<string | null>(() => {
    const measurements = this.measurements.value();
    for (const measurement of measurements) {
      const location = measurement.infos?.['location'];
      if (typeof location === 'string' && location.length > 0) return location;
    }
    return null;
  });

  protected readonly chartSeries = computed<PhChartSeries[]>(() => {
    const field = this.activeField();

    if (!field) {
      return [];
    }

    return [
      {
        name: humanizeFieldName(field),
        points: this.sortedMeasurements()
          .filter((measurement) => typeof measurement.fields?.[field] === 'number')
          .map((measurement) => ({
            label: formatTimestamp(measurement.timestamp, compactTimeFormatter),
            value: measurement.fields[field]
          }))
      }
    ];
  });

  protected readonly rows = computed<MeasurementTableRow[]>(() => {
    const field = this.activeField();
    const unit = this.activeUnit();

    if (!field) return [];

    return this.sortedMeasurements()
      .slice()
      .reverse()
      .filter((measurement) => typeof measurement.fields?.[field] === 'number')
      .map((measurement) => ({
        timestamp: formatTimestamp(measurement.timestamp, dateTimeFormatter),
        value: formatValueWithUnit(measurement.fields[field], unit)
      }));
  });

  protected readonly errorMessage = computed(() => {
    if (this.measurements.status() !== 'error') {
      return null;
    }

    const status = this.measurements.statusCode() ?? extractStatus(this.measurements.error());

    if (status === 401) {
      return 'Your session has expired. Please sign in again to continue.';
    }

    if (status === 403) {
      return "You don't have access to measurements. Ask an administrator to grant the measurement:read role.";
    }

    if (status === 404) {
      return "We couldn't find a station with this number.";
    }

    return "We couldn't load measurements for this range. Try a different range or refresh in a moment.";
  });

  protected setRange(range: string): void {
    this.selectedRange.set(range);
  }

  protected setField(field: string): void {
    this.selectedField.set(field);
  }

  protected reload(): void {
    this.suppliers.reload();
    this.measurements.reload();
  }

  private sortedMeasurements(): MeasurementDto[] {
    return [...this.measurements.value()].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  }
}

function formatValueWithUnit(value: number, unit: string | null): string {
  const formatted = formatNumber(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 3
  }).format(value);
}

function formatTimestamp(value: string, formatter: Intl.DateTimeFormat): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatter.format(date);
}

function extractStatus(error: Error | undefined): number | undefined {
  const status = (error as unknown as { status?: unknown } | undefined)?.status;

  return typeof status === 'number' ? status : undefined;
}

function humanizeFieldName(field: string): string {
  if (!field) {
    return field;
  }

  const spaced = field.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();

  if (!spaced) {
    return field;
  }

  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

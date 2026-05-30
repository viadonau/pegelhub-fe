import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  field: string;
  value: string;
  infos: string;
  measurement: string;
}

const MEASUREMENT_COLUMNS: PhTableColumn[] = [
  { field: 'timestamp', header: 'Timestamp' },
  { field: 'field', header: 'Field' },
  { field: 'value', header: 'Value' },
  { field: 'infos', header: 'Infos' },
  { field: 'measurement', header: 'Measurement ID' }
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

  protected readonly ranges = MEASUREMENT_RANGES;
  protected readonly selectedRange = signal(MEASUREMENT_RANGES[1].value);
  protected readonly selectedField = signal<string | null>(null);

  protected readonly suppliers = this.suppliersApi.suppliersResource();
  protected readonly measurements = this.measurementsApi.measurementsBySupplierResource(this.stationNumber, this.selectedRange);
  protected readonly columns = MEASUREMENT_COLUMNS;

  protected readonly supplier = computed(() =>
    this.suppliers.value().find((supplier) => supplier.stationNumber === this.stationNumber())
  );

  protected readonly fieldNames = computed(() => {
    const names = new Set<string>();

    for (const measurement of this.measurements.value()) {
      for (const fieldName of Object.keys(measurement.fields ?? {})) {
        names.add(fieldName);
      }
    }

    return [...names].sort();
  });

  protected readonly activeField = computed(() => {
    const selectedField = this.selectedField();
    const fieldNames = this.fieldNames();

    if (selectedField && fieldNames.includes(selectedField)) {
      return selectedField;
    }

    return fieldNames[0] ?? null;
  });
  protected readonly activeFieldValue = computed(() => this.activeField() ?? '');
  protected readonly chartYLabel = computed(() => this.activeField() ?? undefined);

  protected readonly chartSeries = computed<PhChartSeries[]>(() => {
    const field = this.activeField();

    if (!field) {
      return [];
    }

    return [
      {
        name: field,
        points: this.sortedMeasurements()
          .filter((measurement) => typeof measurement.fields?.[field] === 'number')
          .map((measurement) => ({
            label: formatTimestamp(measurement.timestamp, compactTimeFormatter),
            value: measurement.fields[field]
          }))
      }
    ];
  });

  protected readonly rows = computed<MeasurementTableRow[]>(() =>
    this.sortedMeasurements().flatMap((measurement) => {
      const fieldEntries = Object.entries(measurement.fields ?? {});

      if (fieldEntries.length === 0) {
        return [
          {
            timestamp: formatTimestamp(measurement.timestamp, dateTimeFormatter),
            field: '-',
            value: '-',
            infos: formatInfos(measurement.infos),
            measurement: measurement.measurement
          }
        ];
      }

      return fieldEntries.map(([field, value]) => ({
        timestamp: formatTimestamp(measurement.timestamp, dateTimeFormatter),
        field,
        value: formatNumber(value),
        infos: formatInfos(measurement.infos),
        measurement: measurement.measurement
      }));
    })
  );

  protected readonly errorMessage = computed(() => {
    if (this.measurements.status() !== 'error') {
      return null;
    }

    const status = this.measurements.statusCode() ?? extractStatus(this.measurements.error());

    if (status === 401) {
      return 'Core rejected the measurement request as unauthenticated. The bearer token was missing, expired, or invalid.';
    }

    if (status === 403) {
      return 'Core rejected the measurement request as forbidden. The user likely needs measurement:read for pegelhub-core-api.';
    }

    if (status === 404) {
      return 'Core could not find a supplier for this station number.';
    }

    return 'The measurement request failed. Check Core availability, the selected range, and the runtime API base URL.';
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

function formatInfos(infos: Record<string, string> | undefined): string {
  const entries = Object.entries(infos ?? {});

  if (entries.length === 0) {
    return '-';
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
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

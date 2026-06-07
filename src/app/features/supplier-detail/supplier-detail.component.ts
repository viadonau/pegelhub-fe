import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { MeasurementDto } from '../../core/api/measurement.dto';
import { MeasurementApiService } from '../../core/api/measurement-api.service';
import { SupplierApiService } from '../../core/api/supplier-api.service';
import { BANK_LABEL, describeParameter } from '../../core/station/parameter-legend';
import { PhButtonComponent } from '../../ui/button/button.component';
import { PhLineChartComponent, PhChartSeries } from '../../ui/chart/line-chart.component';
import { PhDisplayItemComponent } from '../../ui/display-item/display-item.component';
import { PhLoadingComponent } from '../../ui/loading/loading.component';
import { PhMessageComponent } from '../../ui/message/message.component';
import { PhSelectFieldComponent } from '../../ui/select-field/select-field.component';
import { PhTableColumn, PhTableComponent } from '../../ui/table/table.component';
import { MEASUREMENT_RANGES } from './measurement-range';

interface MeasurementTableRow {
  timestamp: string;
  value: string;
}

interface LatestReading {
  timestamp: string;
  value: string;
}

interface ReadingDelta {
  label: string;
  direction: 'rising' | 'falling' | 'stable';
}

interface ParameterOption {
  value: string;
  /** Operator-vocabulary code if recognised (W / WT / Q), otherwise the humanised field name. */
  badge: string;
  label: string;
  unit?: string;
}

const KM_FORMATTER = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const PNP_FORMATTER = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const OWNER_LABEL: Record<string, string> = {
  via: 'viadonau',
};

/** Best-effort mapping from measurement field keys to the operator parameter codes. */
const PARAMETER_CODE_PATTERNS: Array<{ code: 'W' | 'WT' | 'Q'; pattern: RegExp }> = [
  { code: 'WT', pattern: /(wassertemperatur|water[_\s-]?temp|temperature)/i },
  { code: 'Q', pattern: /(abfluss|discharge|durchfluss)/i },
  { code: 'W', pattern: /(wasserstand|water[_\s-]?level|gauge[_\s-]?level|level)/i },
];

function detectParameterCode(field: string): 'W' | 'WT' | 'Q' | null {
  for (const entry of PARAMETER_CODE_PATTERNS) {
    if (entry.pattern.test(field)) return entry.code;
  }
  return null;
}

const MEASUREMENT_COLUMNS: PhTableColumn[] = [
  { field: 'timestamp', header: 'Timestamp' },
  { field: 'value', header: 'Reading', align: 'end' },
];

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

const compactTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

@Component({
  selector: 'app-supplier-detail',
  imports: [
    RouterLink,
    PhButtonComponent,
    PhDisplayItemComponent,
    PhLineChartComponent,
    PhLoadingComponent,
    PhMessageComponent,
    PhSelectFieldComponent,
    PhTableComponent,
  ],
  templateUrl: './supplier-detail.component.html',
  styleUrl: './supplier-detail.component.scss',
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
  protected readonly measurements = this.measurementsApi.measurementsBySupplierResource(
    this.stationNumber,
    this.selectedRange,
  );
  protected readonly columns = MEASUREMENT_COLUMNS;

  protected readonly supplier = computed(() =>
    this.suppliers.value().find((supplier) => supplier.stationNumber === this.stationNumber()),
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

  protected readonly activeField = computed(() => {
    const selectedField = this.selectedField();
    const fieldNames = this.fieldNames();

    if (selectedField && fieldNames.includes(selectedField)) {
      return selectedField;
    }

    return fieldNames[0] ?? null;
  });
  protected readonly activeFieldValue = computed(() => this.activeField() ?? '');
  protected readonly fieldOptions = computed(() =>
    this.fieldNames().map((field) => ({
      label: humanizeFieldName(field),
      value: field,
    })),
  );
  protected readonly parameterSegments = computed<ParameterOption[]>(() =>
    this.fieldNames().map((field) => {
      const code = detectParameterCode(field);
      const meta = code ? describeParameter(code) : undefined;
      const humanized = humanizeFieldName(field);
      return {
        value: field,
        badge: code ?? humanized,
        // Avoid duplicating the badge as the segment label when no parameter
        // code was detected; the badge already carries the humanised field name.
        label: meta?.label ?? '',
        unit: meta?.unit,
      };
    }),
  );
  protected readonly useSegmentedParameters = computed(
    () => this.parameterSegments().length >= 2 && this.parameterSegments().length <= 3,
  );
  protected readonly hasParameterChoice = computed(() => this.parameterSegments().length >= 2);
  protected readonly chartYLabel = computed(() => {
    const field = this.activeField();
    if (!field) return undefined;
    const unit = this.activeUnit();
    const label = humanizeFieldName(field);
    return unit ? `${label} (${unit})` : label;
  });

  protected readonly activeUnit = computed<string | null>(() => {
    const measurements = this.measurements.value();
    for (const measurement of measurements) {
      const unit = measurement.infos?.['unit'];
      if (typeof unit === 'string' && unit.length > 0) return unit;
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
            value: measurement.fields[field],
          })),
      },
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
        value: formatValueWithUnit(measurement.fields[field], unit),
      }));
  });
  protected readonly latestReading = computed<LatestReading | null>(() => {
    const field = this.activeField();
    const unit = this.activeUnit();

    if (!field) {
      return null;
    }

    const measurement = this.sortedMeasurements()
      .slice()
      .reverse()
      .find((measurement) => typeof measurement.fields?.[field] === 'number');

    if (!measurement) {
      return null;
    }

    return {
      timestamp: formatTimestamp(measurement.timestamp, compactTimeFormatter),
      value: formatValueWithUnit(measurement.fields[field], unit),
    };
  });
  protected readonly activeFieldLabel = computed(() => {
    const field = this.activeField();
    if (!field) return '';
    const code = detectParameterCode(field);
    if (code) {
      return describeParameter(code)?.label ?? humanizeFieldName(field);
    }
    // For generic / undetected field names like "value", suppress the kicker
    // entirely; the chart and number are self-explanatory.
    if (/^value$/i.test(field)) return '';
    return humanizeFieldName(field);
  });
  protected readonly latestReadingNumber = computed<string | null>(() => {
    const field = this.activeField();
    if (!field) return null;

    const measurement = this.sortedMeasurements()
      .slice()
      .reverse()
      .find((measurement) => typeof measurement.fields?.[field] === 'number');

    return measurement ? formatNumber(measurement.fields[field] as number) : null;
  });
  protected readonly delta = computed<ReadingDelta | null>(() => {
    const field = this.activeField();
    if (!field) return null;

    const numericPair = this.sortedMeasurements()
      .filter((measurement) => typeof measurement.fields?.[field] === 'number')
      .slice(-2);

    if (numericPair.length < 2) return null;

    const [prev, latest] = numericPair;
    const diff = (latest.fields[field] as number) - (prev.fields[field] as number);
    const unit = this.activeUnit();
    const sign = diff > 0 ? '+' : diff < 0 ? '−' : '±';
    const formatted = formatNumber(Math.abs(diff));
    const label = `${sign}${formatted}${unit ? ' ' + unit : ''} vs prior`;
    const direction: ReadingDelta['direction'] =
      diff > 0 ? 'rising' : diff < 0 ? 'falling' : 'stable';

    return { label, direction };
  });
  protected readonly waterLabel = computed<string | null>(
    () => this.supplier()?.stationWater ?? null,
  );

  protected readonly riverKmLabel = computed<string | null>(() => {
    const km = this.supplier()?.riverKm;
    return km === undefined || km === null ? null : `km ${KM_FORMATTER.format(km)}`;
  });

  protected readonly bankLabel = computed<string | null>(() => {
    const bank = this.supplier()?.bank;
    return bank ? (BANK_LABEL[bank] ?? null) : null;
  });

  protected readonly pnpLabel = computed<string | null>(() => {
    const pnp = this.supplier()?.pnp;
    return pnp === undefined || pnp === null ? null : `${PNP_FORMATTER.format(pnp)} m ü.A.`;
  });

  protected readonly ownerLabel = computed<string | null>(() => {
    const owner = this.supplier()?.owner;
    if (!owner) return null;
    return OWNER_LABEL[owner] ?? owner;
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
    return [...this.measurements.value()].sort((left, right) =>
      left.timestamp.localeCompare(right.timestamp),
    );
  }
}

function formatValueWithUnit(value: number, unit: string | null): string {
  const formatted = formatNumber(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 3,
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

  const spaced = field
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

  if (!spaced) {
    return field;
  }

  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

export interface MeasurementRange {
  label: string;
  value: string;
}

export const MEASUREMENT_RANGES: MeasurementRange[] = [
  { label: '3 hours', value: '3h' },
  { label: '24 hours', value: '24h' },
  { label: '7 days', value: '7d' }
];

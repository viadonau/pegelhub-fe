import { StationParameterCode } from '../api/supplier.dto';

/**
 * Display metadata for the station parameter codes used in the operator
 * catalogue (see docs/operator-station-metadata.md).
 *
 * The codes themselves (`W`, `WT`, `Q`) are the operator vocabulary and stay
 * verbatim in the UI; the labels are exposed as tooltips and as the
 * humanised name on the detail-page parameter switcher.
 */
export interface StationParameterMeta {
  code: StationParameterCode;
  label: string;
  unit: string;
}

export const STATION_PARAMETER_LEGEND: Record<StationParameterCode, StationParameterMeta> = {
  W: { code: 'W', label: 'Wasserstand', unit: 'cm' },
  WT: { code: 'WT', label: 'Wassertemperatur', unit: '°C' },
  Q: { code: 'Q', label: 'Abfluss', unit: 'm³/s' },
};

export function describeParameter(code: string): StationParameterMeta | undefined {
  return STATION_PARAMETER_LEGEND[code as StationParameterCode];
}

export const BANK_LABEL: Record<'li' | 're', string> = {
  li: 'Linkes Ufer',
  re: 'Rechtes Ufer',
};

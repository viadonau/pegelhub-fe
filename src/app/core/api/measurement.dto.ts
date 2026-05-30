export interface MeasurementDto {
  measurement: string;
  timestamp: string;
  fields: Record<string, number>;
  infos: Record<string, string>;
}

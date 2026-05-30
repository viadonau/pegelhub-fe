export type { SupplierDto } from '../../core/api/supplier.dto';

export interface SupplierOverviewRow {
  id: string;
  stationNumber: string;
  stationName: string;
  stationWater: string;
  lastValue: string;
}

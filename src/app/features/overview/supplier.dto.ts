import { PhTableParameter } from '../../ui/table/table.component';
export type { SupplierDto } from '../../core/api/supplier.dto';

export interface SupplierOverviewRow {
  id: string;
  stationNumber: string;
  stationName: string;
  stationWater: string;
  // TODO(BE): Wire `latestReading` and `lastUpdate` from the supplier list
  // endpoint when it returns per-station measurement summaries. Once
  // available, expose them as additional table columns and the overview
  // header "N stale" counter.
  latestReading?: string;
  lastUpdate?: Date;
  riverKm?: string;
  parameters?: PhTableParameter[];
  owner?: string;
}

export type StationOwner = 'via' | 'DHK' | 'VHP';
export type StationBank = 'li' | 're';
export type StationParameterCode = 'W' | 'WT' | 'Q';

export interface SupplierDto {
  id: string;
  stationNumber: string;
  stationId: number;
  stationName: string;
  stationWater: string;
  stationWaterType: string;

  // TODO(BE): The fields below come from the operator station-metadata
  // catalogue (see docs/operator-station-metadata.md). They are currently
  // mocked client-side so the UI can be designed against realistic shapes.
  // When the supplier endpoint joins this metadata, drop the mock decorator
  // in `supplier-api.service.ts`. All fields are optional so the UI stays
  // honest if any one of them is missing.
  riverKm?: number;
  parameters?: StationParameterCode[];
  owner?: StationOwner;
  bank?: StationBank;
  hzbId?: string;
  pnp?: number | null;
}

import { StationBank, StationOwner, StationParameterCode, SupplierDto } from './supplier.dto';

/**
 * MOCK ONLY — operator station metadata.
 *
 * Generates plausible, deterministic operator metadata (river kilometre,
 * parameter set, bank, owner, HZB id, PNP) from the existing supplier
 * fields so the overview and detail surfaces can be designed against
 * realistic shapes today. Every value is deterministic for a given
 * stationNumber to keep navigation stable across refreshes.
 *
 * TODO(BE): Delete this file and the decorator wired up in
 * `supplier-api.service.ts` as soon as the supplier endpoint returns the
 * fields described in `docs/operator-station-metadata.md`.
 */

const PARAMETER_PRESETS: ReadonlyArray<readonly StationParameterCode[]> = [
  ['W'],
  ['W', 'WT'],
  ['W', 'Q'],
  ['W', 'WT', 'Q'],
];

const BANK_PRESETS: ReadonlyArray<StationBank> = ['li', 're'];

const OWNER_PRESETS: ReadonlyArray<StationOwner> = [
  // Weighted toward `via` to mirror the real distribution observed in the
  // catalogue: most stations are operated by viadonau itself.
  'via',
  'via',
  'via',
  'via',
  'via',
  'via',
  'via',
  'DHK',
  'VHP',
];

export function decorateSupplierWithMockMetadata(supplier: SupplierDto): SupplierDto {
  if (
    supplier.riverKm !== undefined ||
    supplier.parameters !== undefined ||
    supplier.owner !== undefined
  ) {
    return supplier;
  }

  const seed = hashStationKey(supplier.stationNumber || supplier.id || supplier.stationName);

  const isDonaukanal = /donaukanal|kanal/i.test(supplier.stationWater ?? '');
  const km = isDonaukanal
    ? roundTo(pickFloat(seed, 0, 17.3), 2)
    : roundTo(pickFloat(seed + 1, 1894, 1949), 2);

  const parameters = PARAMETER_PRESETS[seed % PARAMETER_PRESETS.length];
  const bank = BANK_PRESETS[(seed >> 3) % BANK_PRESETS.length];
  const owner = OWNER_PRESETS[(seed >> 5) % OWNER_PRESETS.length];

  const hzbId = formatHzbId(seed);
  const pnp = parameters.includes('W') ? roundTo(pickFloat(seed + 7, 130, 168), 2) : null;

  return {
    ...supplier,
    riverKm: km,
    parameters: [...parameters],
    bank,
    owner,
    hzbId,
    pnp,
  };
}

function hashStationKey(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function pickFloat(seed: number, min: number, max: number): number {
  const fraction = ((seed * 9301 + 49297) % 233280) / 233280;
  return min + (max - min) * fraction;
}

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatHzbId(seed: number): string {
  const numeric = (seed % 900_000) + 100_000;
  return String(numeric);
}

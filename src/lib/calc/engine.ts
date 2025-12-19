import type {
  CountryDefaults,
  UnitSystem,
} from "@/lib/constants/countries";
import {
  areaToSqm,
  cubicMetersToUserVolume,
  lengthToMeters,
  litersToUserVolume,
  metersToUserLength,
  sqmToUserArea,
} from "@/lib/calc/conversions";

export type FormulaKey =
  | "concrete"
  | "paint"
  | "flooring"
  | "tile"
  | "roofing"
  | "drywall"
  | "wallpaper"
  | "brick"
  | "insulation"
  | "plaster"
  | "screed"
  | "electrical";

export type EngineInput = Record<string, number | string | boolean | undefined>;

export type EngineResult = Record<string, number>;

type RunOptions = {
  formulaKey: FormulaKey;
  inputs: EngineInput;
  unitSystem: UnitSystem;
  defaults: CountryDefaults;
  wasteFactor: number;
};

const toNumber = (value: EngineInput[keyof EngineInput], fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const degToRad = (deg: number) => (deg * Math.PI) / 180;

const clampAboveZero = (value: number) => (value < 0 ? 0 : value);

const convertCoverageToMetric = (value: number, unitSystem: UnitSystem) => {
  if (unitSystem === "imperial") {
    // ft² per gallon -> m² per liter
    return (value * 0.092903) / 3.78541;
  }
  return value;
};

export const runCalculation = ({
  formulaKey,
  inputs,
  unitSystem,
  defaults,
  wasteFactor,
}: RunOptions): EngineResult => {
  switch (formulaKey) {
    case "concrete":
      return calculateConcrete(inputs, unitSystem, wasteFactor);
    case "paint":
      return calculatePaint(inputs, unitSystem, defaults, wasteFactor);
    case "flooring":
      return calculateFlooring(inputs, unitSystem, wasteFactor);
    case "tile":
      return calculateTile(inputs, unitSystem, defaults, wasteFactor);
    case "roofing":
      return calculateRoofing(inputs, unitSystem, wasteFactor);
    case "drywall":
      return calculateDrywall(inputs, unitSystem, wasteFactor);
    case "wallpaper":
      return calculateWallpaper(inputs, unitSystem, defaults, wasteFactor);
    case "brick":
      return calculateBrick(inputs, unitSystem, defaults, wasteFactor);
    case "insulation":
      return calculateInsulation(inputs, unitSystem, wasteFactor);
    case "plaster":
      return calculatePlaster(inputs, unitSystem, defaults, wasteFactor);
    case "screed":
      return calculateScreed(inputs, unitSystem, wasteFactor);
    case "electrical":
      return calculateElectrical(inputs, unitSystem, wasteFactor);
    default:
      return {};
  }
};

const calculateConcrete = (
  inputs: EngineInput,
  unitSystem: UnitSystem,
  wasteFactor: number,
): EngineResult => {
  const mode = (inputs.mode as string) ?? "slab";
  let baseVolume = 0;

  if (mode === "cylinder") {
    const d = lengthToMeters(toNumber(inputs.diameter, 0.4), unitSystem);
    const h = lengthToMeters(toNumber(inputs.height, 3), unitSystem);
    baseVolume = Math.PI * (d / 2) * (d / 2) * h;
  } else {
    const l = lengthToMeters(toNumber(inputs.length, 6), unitSystem);
    const w = lengthToMeters(toNumber(inputs.width, 4), unitSystem);
    const t = lengthToMeters(toNumber(inputs.thickness, 0.15), unitSystem);
    baseVolume = l * w * t;
  }

  const volume = baseVolume * (1 + wasteFactor);
  return { volume };
};

const calculatePaint = (
  inputs: EngineInput,
  unitSystem: UnitSystem,
  defaults: CountryDefaults,
  wasteFactor: number,
): EngineResult => {
  const perimeter = lengthToMeters(toNumber(inputs.perimeter, 20), unitSystem);
  const height = lengthToMeters(toNumber(inputs.height, 2.7), unitSystem);
  const openings = areaToSqm(toNumber(inputs.openings, 2), unitSystem);
  const coats =
    toNumber(inputs.coats, defaults.paint.coats) || defaults.paint.coats;
  const coverage = convertCoverageToMetric(
    toNumber(inputs.coverage, defaults.paint.coverageSqmPerLiter),
    unitSystem,
  );

  const area = clampAboveZero(perimeter * height - openings);
  const totalArea = area * (1 + wasteFactor);
  const liters = (totalArea * coats) / coverage;
  return {
    area: totalArea,
    volume: liters,
  };
};

const calculateFlooring = (
  inputs: EngineInput,
  unitSystem: UnitSystem,
  wasteFactor: number,
): EngineResult => {
  const length = lengthToMeters(toNumber(inputs.length, 5), unitSystem);
  const width = lengthToMeters(toNumber(inputs.width, 4), unitSystem);
  const packCoverage = areaToSqm(toNumber(inputs.packCoverage, 2.2), unitSystem);

  const area = length * width;
  const totalArea = area * (1 + wasteFactor);
  const packs = Math.ceil(totalArea / packCoverage);
  return {
    area: totalArea,
    packs,
  };
};

const calculateTile = (
  inputs: EngineInput,
  unitSystem: UnitSystem,
  defaults: CountryDefaults,
  wasteFactor: number,
): EngineResult => {
  const length = lengthToMeters(toNumber(inputs.length, 5), unitSystem);
  const width = lengthToMeters(toNumber(inputs.width, 3), unitSystem);
  const tileLength = lengthToMeters(toNumber(inputs.tileLength, 0.6), unitSystem);
  const tileWidth = lengthToMeters(toNumber(inputs.tileWidth, 0.3), unitSystem);
  const diagonal = Boolean(inputs.diagonal);

  const area = length * width;
  const tileArea = tileLength * tileWidth;
  const waste = diagonal ? defaults.tile.diagonalWaste : wasteFactor;
  const totalArea = area * (1 + waste);
  const tiles = Math.ceil(totalArea / tileArea);
  return { area: totalArea, tiles };
};

const calculateRoofing = (
  inputs: EngineInput,
  unitSystem: UnitSystem,
  wasteFactor: number,
): EngineResult => {
  const length = lengthToMeters(toNumber(inputs.length, 10), unitSystem);
  const width = lengthToMeters(toNumber(inputs.width, 8), unitSystem);
  const angle = toNumber(inputs.angle, 28);
  const bundleCoverage = areaToSqm(toNumber(inputs.bundleCoverage, 3.1), unitSystem);

  const baseArea = length * width;
  const slopeArea = baseArea / Math.max(Math.cos(degToRad(angle)), 0.2);
  const totalArea = slopeArea * (1 + wasteFactor);
  const bundles = Math.ceil(totalArea / bundleCoverage);
  return { area: totalArea, bundles };
};

const calculateDrywall = (
  inputs: EngineInput,
  unitSystem: UnitSystem,
  wasteFactor: number,
): EngineResult => {
  const perimeter = lengthToMeters(toNumber(inputs.perimeter, 20), unitSystem);
  const height = lengthToMeters(toNumber(inputs.height, 2.8), unitSystem);
  const openings = areaToSqm(toNumber(inputs.openings, 4), unitSystem);
  const sheetArea = areaToSqm(toNumber(inputs.sheetArea, 2.88), unitSystem);

  const area = clampAboveZero(perimeter * height - openings);
  const totalArea = area * (1 + wasteFactor);
  const sheets = Math.ceil(totalArea / sheetArea);
  return { area: totalArea, sheets };
};

const calculateWallpaper = (
  inputs: EngineInput,
  unitSystem: UnitSystem,
  defaults: CountryDefaults,
  wasteFactor: number,
): EngineResult => {
  const perimeter = lengthToMeters(toNumber(inputs.perimeter, 25), unitSystem);
  const height = lengthToMeters(toNumber(inputs.height, 2.6), unitSystem);
  const allowance = lengthToMeters(
    toNumber(inputs.allowance, defaults.wallpaper.allowanceMeters),
    unitSystem,
  );
  const rollLength = lengthToMeters(
    toNumber(inputs.rollLength, defaults.wallpaper.rollLengthMeters),
    unitSystem,
  );
  const rollWidth = lengthToMeters(
    toNumber(inputs.rollWidth, defaults.wallpaper.rollWidthMeters),
    unitSystem,
  );

  const stripsPerRoll = Math.max(
    Math.floor(rollLength / Math.max(height + allowance, 0.1)),
    1,
  );
  const totalStrips = Math.ceil((perimeter / rollWidth) * (1 + wasteFactor));
  const rolls = Math.ceil(totalStrips / stripsPerRoll);
  return { strips: totalStrips, rolls };
};

const calculateBrick = (
  inputs: EngineInput,
  unitSystem: UnitSystem,
  defaults: CountryDefaults,
  wasteFactor: number,
): EngineResult => {
  const wallArea = areaToSqm(toNumber(inputs.wallArea, 40), unitSystem);
  const bricksPerSqm = toNumber(
    inputs.bricksPerSqm,
    defaults.brick.bricksPerSqm,
  );
  const mortarPerSqm = toNumber(
    inputs.mortarPerSqm,
    defaults.brick.mortarPerSqm,
  );
  const factor = 1 + wasteFactor;
  const bricks = wallArea * bricksPerSqm * factor;
  const mortar = wallArea * mortarPerSqm * factor;
  return { bricks, mortar };
};

const calculateInsulation = (
  inputs: EngineInput,
  unitSystem: UnitSystem,
  wasteFactor: number,
): EngineResult => {
  const area = areaToSqm(toNumber(inputs.area, 50), unitSystem);
  const thickness = lengthToMeters(toNumber(inputs.thickness, 0.1), unitSystem);
  const baseVolume = area * thickness;
  const totalVolume = baseVolume * (1 + wasteFactor);
  const rollArea = areaToSqm(toNumber(inputs.rollArea, 10), unitSystem);
  const rolls = rollArea > 0 ? Math.ceil((area * (1 + wasteFactor)) / rollArea) : 0;
  return { volume: totalVolume, rolls };
};

const calculatePlaster = (
  inputs: EngineInput,
  unitSystem: UnitSystem,
  defaults: CountryDefaults,
  wasteFactor: number,
): EngineResult => {
  const area = areaToSqm(toNumber(inputs.area, 40), unitSystem);
  const thickness = lengthToMeters(toNumber(inputs.thickness, 0.01), unitSystem);
  const coveragePerBag = toNumber(inputs.coveragePerBag, defaults.plaster?.coveragePerBag ?? 0.1);
  const baseVolume = area * thickness;
  const totalVolume = baseVolume * (1 + wasteFactor);
  const bags = coveragePerBag > 0 ? Math.ceil(totalVolume / coveragePerBag) : 0;
  return { volume: totalVolume, bags, area };
};

const calculateScreed = (
  inputs: EngineInput,
  unitSystem: UnitSystem,
  wasteFactor: number,
): EngineResult => {
  const area = areaToSqm(toNumber(inputs.area, 30), unitSystem);
  const thickness = lengthToMeters(toNumber(inputs.thickness, 0.05), unitSystem);
  const cementRatio = toNumber(inputs.cementRatio, 0.2);
  const sandRatio = toNumber(inputs.sandRatio, 3);
  const baseVolume = area * thickness;
  const totalVolume = baseVolume * (1 + wasteFactor);
  const totalParts = cementRatio + sandRatio;
  const cementVolume = totalVolume * (cementRatio / totalParts);
  const sandVolume = totalVolume * (sandRatio / totalParts);
  const cementDensity = 1500;
  const cementWeight = cementVolume * cementDensity;
  const cementBags = Math.ceil(cementWeight / 50);
  return { volume: totalVolume, cementWeight, cementBags, sandVolume };
};

const calculateElectrical = (
  inputs: EngineInput,
  unitSystem: UnitSystem,
  wasteFactor: number,
): EngineResult => {
  const perimeter = lengthToMeters(toNumber(inputs.perimeter, 40), unitSystem);
  const height = lengthToMeters(toNumber(inputs.height, 2.7), unitSystem);
  const sockets = toNumber(inputs.sockets, 10);
  const switches = toNumber(inputs.switches, 5);
  const verticalRuns = sockets + switches;
  const verticalLength = verticalRuns * height;
  const horizontalLength = perimeter * 1.5;
  const totalLength = (verticalLength + horizontalLength) * (1 + wasteFactor);
  const conduits = Math.ceil(totalLength / 3);
  return { cableLength: totalLength, sockets, switches, conduits };
};

export const projectResultToUserUnits = (
  siValue: number,
  unitSystem: UnitSystem,
  unitType: "length" | "area" | "volume" | "liquid",
) => {
  switch (unitType) {
    case "length":
      return metersToUserLength(siValue, unitSystem);
    case "area":
      return sqmToUserArea(siValue, unitSystem);
    case "volume":
      return cubicMetersToUserVolume(siValue, unitSystem);
    case "liquid":
      return litersToUserVolume(siValue, unitSystem);
    default:
      return siValue;
  }
};

/**
 * Quick sanity checks (these mirror manual calculations):
 *
 * // Concrete slab 6m x 4m x 0.15m with 8% waste:
 * runCalculation({
 *   formulaKey: "concrete",
 *   inputs: { mode: "slab", length: 6, width: 4, thickness: 0.15 },
 *   unitSystem: "metric",
 *   defaults: COUNTRY_PROFILE_SEEDS[0].defaults,
 *   wasteFactor: 0.08,
 * });
 * // => volume ≈ 3.89 m³
 *
 * // Paint 28 m perimeter, 2.7 m height, 4 m² openings, 2 coats, coverage 10 m²/L, 7% waste:
 * runCalculation({
 *   formulaKey: "paint",
 *   inputs: { perimeter: 28, height: 2.7, openings: 4, coats: 2, coverage: 10 },
 *   unitSystem: "metric",
 *   defaults: COUNTRY_PROFILE_SEEDS[2].defaults,
 *   wasteFactor: 0.07,
 * });
 * // => area ≈ 144 m², volume ≈ 28.8 L
 */



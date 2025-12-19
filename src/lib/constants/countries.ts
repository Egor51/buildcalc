export type UnitSystem = "metric" | "imperial";

export type CountryDefaults = {
  waste: Record<string, number>;
  paint: {
    coverageSqmPerLiter: number;
    coats: number;
  };
  flooring: {
    packCoverageSqm: number;
  };
  tile: {
    tileAreaSqm: number;
    diagonalWaste: number;
  };
  drywall: {
    sheetAreaSqm: number;
  };
  wallpaper: {
    rollLengthMeters: number;
    rollWidthMeters: number;
    allowanceMeters: number;
  };
  roofing: {
    bundleCoverageSqm: number;
    defaultAngleDegrees: number;
  };
  brick: {
    bricksPerSqm: number;
    mortarPerSqm: number;
  };
  insulation?: {
    rollAreaSqm: number;
  };
  plaster?: {
    coveragePerBag: number;
  };
};

export type CountryProfileSeed = {
  countryCode: string;
  nameEn: string;
  nameRu: string;
  unitSystem: UnitSystem;
  currency: string;
  defaults: CountryDefaults;
};

const baseWaste = {
  concrete: 0.08,
  paint: 0.07,
  flooring: 0.08,
  tile: 0.1,
  roofing: 0.07,
  drywall: 0.12,
  wallpaper: 0.08,
  brick: 0.05,
  insulation: 0.08,
  plaster: 0.1,
  screed: 0.06,
  electrical: 0.12,
};

export const COUNTRY_PROFILE_SEEDS: CountryProfileSeed[] = [
  {
    countryCode: "US",
    nameEn: "United States",
    nameRu: "США",
    unitSystem: "imperial",
    currency: "USD",
    defaults: {
      waste: { ...baseWaste, concrete: 0.09, drywall: 0.15 },
      paint: { coverageSqmPerLiter: 9.3, coats: 2 },
      flooring: { packCoverageSqm: 2.23 },
      tile: { tileAreaSqm: 0.25, diagonalWaste: 0.15 },
      drywall: { sheetAreaSqm: 2.973 }, // 4ft x 8ft
      wallpaper: {
        rollLengthMeters: 10.06,
        rollWidthMeters: 0.527,
        allowanceMeters: 0.1,
      },
      roofing: { bundleCoverageSqm: 3.06, defaultAngleDegrees: 26 },
      brick: { bricksPerSqm: 50, mortarPerSqm: 0.036 },
      insulation: { rollAreaSqm: 9.3 },
      plaster: { coveragePerBag: 0.1 },
    },
  },
  {
    countryCode: "GB",
    nameEn: "United Kingdom",
    nameRu: "Великобритания",
    unitSystem: "metric",
    currency: "GBP",
    defaults: {
      waste: { ...baseWaste, tile: 0.12 },
      paint: { coverageSqmPerLiter: 11, coats: 2 },
      flooring: { packCoverageSqm: 2.6 },
      tile: { tileAreaSqm: 0.24, diagonalWaste: 0.13 },
      drywall: { sheetAreaSqm: 2.88 },
      wallpaper: {
        rollLengthMeters: 10.05,
        rollWidthMeters: 0.53,
        allowanceMeters: 0.08,
      },
      roofing: { bundleCoverageSqm: 3.1, defaultAngleDegrees: 30 },
      brick: { bricksPerSqm: 52, mortarPerSqm: 0.035 },
      insulation: { rollAreaSqm: 10 },
      plaster: { coveragePerBag: 0.12 },
    },
  },
  {
    countryCode: "DE",
    nameEn: "Germany",
    nameRu: "Германия",
    unitSystem: "metric",
    currency: "EUR",
    defaults: {
      waste: { ...baseWaste, concrete: 0.07, tile: 0.11 },
      paint: { coverageSqmPerLiter: 12, coats: 2 },
      flooring: { packCoverageSqm: 2.5 },
      tile: { tileAreaSqm: 0.23, diagonalWaste: 0.12 },
      drywall: { sheetAreaSqm: 3.0 },
      wallpaper: {
        rollLengthMeters: 10,
        rollWidthMeters: 0.53,
        allowanceMeters: 0.07,
      },
      roofing: { bundleCoverageSqm: 3.2, defaultAngleDegrees: 32 },
      brick: { bricksPerSqm: 48, mortarPerSqm: 0.033 },
      insulation: { rollAreaSqm: 10 },
      plaster: { coveragePerBag: 0.11 },
    },
  },
  {
    countryCode: "RU",
    nameEn: "Russia",
    nameRu: "Россия",
    unitSystem: "metric",
    currency: "RUB",
    defaults: {
      waste: { ...baseWaste, drywall: 0.13, wallpaper: 0.09 },
      paint: { coverageSqmPerLiter: 10.5, coats: 2 },
      flooring: { packCoverageSqm: 2.4 },
      tile: { tileAreaSqm: 0.25, diagonalWaste: 0.12 },
      drywall: { sheetAreaSqm: 3.0 },
      wallpaper: {
        rollLengthMeters: 10.05,
        rollWidthMeters: 0.53,
        allowanceMeters: 0.1,
      },
      roofing: { bundleCoverageSqm: 3.15, defaultAngleDegrees: 30 },
      brick: { bricksPerSqm: 51, mortarPerSqm: 0.035 },
      insulation: { rollAreaSqm: 9.5 },
      plaster: { coveragePerBag: 0.1 },
    },
  },
  {
    countryCode: "IN",
    nameEn: "India",
    nameRu: "Индия",
    unitSystem: "metric",
    currency: "INR",
    defaults: {
      waste: { ...baseWaste, paint: 0.08, brick: 0.08 },
      paint: { coverageSqmPerLiter: 9, coats: 2 },
      flooring: { packCoverageSqm: 2.1 },
      tile: { tileAreaSqm: 0.22, diagonalWaste: 0.12 },
      drywall: { sheetAreaSqm: 2.88 },
      wallpaper: {
        rollLengthMeters: 10,
        rollWidthMeters: 0.52,
        allowanceMeters: 0.08,
      },
      roofing: { bundleCoverageSqm: 3.0, defaultAngleDegrees: 24 },
      brick: { bricksPerSqm: 54, mortarPerSqm: 0.04 },
      insulation: { rollAreaSqm: 9 },
      plaster: { coveragePerBag: 0.1 },
    },
  },
  {
    countryCode: "CA",
    nameEn: "Canada",
    nameRu: "Канада",
    unitSystem: "metric",
    currency: "CAD",
    defaults: {
      waste: { ...baseWaste, roofing: 0.08 },
      paint: { coverageSqmPerLiter: 10, coats: 2 },
      flooring: { packCoverageSqm: 2.3 },
      tile: { tileAreaSqm: 0.24, diagonalWaste: 0.13 },
      drywall: { sheetAreaSqm: 2.973 },
      wallpaper: {
        rollLengthMeters: 10.06,
        rollWidthMeters: 0.527,
        allowanceMeters: 0.08,
      },
      roofing: { bundleCoverageSqm: 3.05, defaultAngleDegrees: 27 },
      brick: { bricksPerSqm: 50, mortarPerSqm: 0.035 },
      insulation: { rollAreaSqm: 9.3 },
      plaster: { coveragePerBag: 0.1 },
    },
  },
];



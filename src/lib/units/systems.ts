/**
 * Unit system definitions and utilities
 */

import type { UnitSystem } from "@/lib/constants/countries";

export const UNIT_SYSTEMS: Record<UnitSystem, { name: string; abbreviation: string }> = {
  metric: {
    name: "Metric",
    abbreviation: "SI",
  },
  imperial: {
    name: "Imperial",
    abbreviation: "US",
  },
};

/**
 * Get unit label for a given unit kind and system
 */
export const getUnitLabel = (unitSystem: UnitSystem, unitKind?: string): string => {
  if (!unitKind) return "";
  
  if (["length", "width", "height", "thickness", "diameter"].includes(unitKind)) {
    return unitSystem === "imperial" ? "ft" : "m";
  }
  
  if (unitKind === "area") {
    return unitSystem === "imperial" ? "ft²" : "m²";
  }
  
  if (unitKind === "coverage") {
    return unitSystem === "imperial" ? "ft²/gal" : "m²/L";
  }
  
  if (unitKind === "percent") {
    return "%";
  }
  
  if (unitKind === "angle") {
    return "°";
  }
  
  if (unitKind === "volume") {
    return unitSystem === "imperial" ? "yd³" : "m³";
  }
  
  return "";
};


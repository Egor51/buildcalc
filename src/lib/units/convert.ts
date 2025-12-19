/**
 * Unit conversion utilities
 * Converts between metric (SI) and imperial units
 */

import type { UnitSystem } from "@/lib/constants/countries";

const FEET_TO_M = 0.3048;
const SQFT_TO_SQM = 0.092903;
const CUBIC_FT_TO_CUBIC_M = 0.0283168;
const CUBIC_M_TO_CUBIC_YARD = 1.30795062;
const LITER_TO_GALLON = 0.264172;

/**
 * Convert length to meters
 */
export const lengthToMeters = (value: number, unitSystem: UnitSystem) =>
  unitSystem === "imperial" ? value * FEET_TO_M : value;

/**
 * Convert area to square meters
 */
export const areaToSqm = (value: number, unitSystem: UnitSystem) =>
  unitSystem === "imperial" ? value * SQFT_TO_SQM : value;

/**
 * Convert volume to cubic meters
 */
export const volumeToCubicMeters = (value: number, unitSystem: UnitSystem) =>
  unitSystem === "imperial" ? value * CUBIC_FT_TO_CUBIC_M : value;

/**
 * Convert meters to user's length unit
 */
export const metersToUserLength = (value: number, unitSystem: UnitSystem) =>
  unitSystem === "imperial" ? value / FEET_TO_M : value;

/**
 * Convert square meters to user's area unit
 */
export const sqmToUserArea = (value: number, unitSystem: UnitSystem) =>
  unitSystem === "imperial" ? value / SQFT_TO_SQM : value;

/**
 * Convert cubic meters to user's volume unit
 */
export const cubicMetersToUserVolume = (value: number, unitSystem: UnitSystem) =>
  unitSystem === "imperial" ? value * CUBIC_M_TO_CUBIC_YARD : value;

/**
 * Convert liters to user's volume unit
 */
export const litersToUserVolume = (value: number, unitSystem: UnitSystem) =>
  unitSystem === "imperial" ? value * LITER_TO_GALLON : value;


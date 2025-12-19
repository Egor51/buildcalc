/**
 * Relevance map for internal linking between calculators
 * Each calculator should link to at least 4 related calculators
 * This map ensures consistent cross-linking across the site
 */
export const calculatorRelations: Record<string, string[]> = {
  concrete: ["screed", "brick", "plaster", "flooring"],
  paint: ["wallpaper", "plaster", "drywall", "tile"],
  flooring: ["tile", "screed", "insulation", "electrical"],
  tile: ["flooring", "paint", "plaster", "screed"],
  roofing: ["insulation", "drywall", "electrical", "screed"],
  drywall: ["paint", "wallpaper", "insulation", "electrical"],
  wallpaper: ["paint", "drywall", "plaster", "tile"],
  brick: ["concrete", "plaster", "screed", "flooring"],
  insulation: ["roofing", "drywall", "electrical", "screed"],
  plaster: ["paint", "wallpaper", "tile", "concrete"],
  screed: ["concrete", "flooring", "tile", "brick"],
  electrical: ["drywall", "insulation", "roofing", "flooring"],
};

/**
 * Popular calculators for the home page
 * These are the most commonly used calculators
 */
export const popularCalculatorSlugs: string[] = [
  "concrete",
  "paint",
  "flooring",
  "tile",
  "roofing",
  "drywall",
  "wallpaper",
  "brick",
];

/**
 * Get related calculators for a given slug
 * Falls back to empty array if not found
 */
export function getRelatedCalculatorSlugs(slug: string): string[] {
  return calculatorRelations[slug] || [];
}

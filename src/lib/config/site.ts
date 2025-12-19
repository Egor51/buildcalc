export const locales = ["en", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const siteConfig = {
  name: "BuildCalc",
  description:
    "BuildCalc is a global catalog of construction calculators to estimate materials in metric and imperial units.",
  github: "https://github.com/egor/buildcalc",
};

export const calculatorSlugs = [
  "concrete",
  "paint",
  "flooring",
  "tile",
  "roofing",
  "drywall",
  "wallpaper",
  "brick",
] as const;



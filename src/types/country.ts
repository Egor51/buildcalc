import type { CountryDefaults, UnitSystem } from "@/lib/constants/countries";

export type CountryProfileDTO = {
  countryCode: string;
  name: string;
  nameLocalized: string;
  unitSystem: UnitSystem;
  currency: string;
  defaults: CountryDefaults;
};



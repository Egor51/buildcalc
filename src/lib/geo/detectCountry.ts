/**
 * Country detection utilities
 * Detects user's country from headers, cookies, and browser locale
 */

import { cookies, headers } from "next/headers";

import type { Locale } from "@/lib/config/site";
import { COUNTRY_COOKIE_NAME } from "@/lib/constants/storage";
import type { CountryProfileDTO } from "@/types/country";
import { getCountries } from "@/lib/server/calculators";
import type { CountryProfileSeed } from "@/lib/constants/countries";

const headerCountryKeys = ["x-vercel-ip-country", "cf-ipcountry"];

/**
 * Parse Accept-Language header to extract country code
 */
const parseAcceptLanguage = (value?: string | null): string | null => {
  if (!value) return null;
  const tokens = value.split(",").map((part) => part.trim());
  for (const token of tokens) {
    const [localePart] = token.split(";");
    if (!localePart) continue;
    const segments = localePart.split("-");
    if (segments.length > 1) {
      return segments[1]?.toUpperCase() ?? null;
    }
  }
  return null;
};

/**
 * Resolve user's country from multiple sources:
 * 1. Cookie (manual selection)
 * 2. Request headers (Vercel/Cloudflare)
 * 3. Accept-Language header
 * 4. Locale fallback
 */
/**
 * Convert CountryProfileSeed to CountryProfileDTO
 */
const toCountryDTO = (seed: CountryProfileSeed, locale: Locale): CountryProfileDTO => ({
  countryCode: seed.countryCode,
  name: locale === "ru" ? seed.nameRu : seed.nameEn,
  nameLocalized: locale === "ru" ? seed.nameRu : seed.nameEn,
  unitSystem: seed.unitSystem,
  currency: seed.currency,
  defaults: seed.defaults,
});
export const resolveRequestCountry = async (locale: Locale): Promise<CountryProfileDTO> => {
  const availableCountries = await getCountries();
  const map = new Map(
    availableCountries.map((country) => [country.countryCode.toUpperCase(), country]),
  );
  
  const cookieStore = await cookies();
  const stored = cookieStore.get(COUNTRY_COOKIE_NAME)?.value?.toUpperCase();

  const headerStore = await headers();
  const headerDetected =
    headerCountryKeys
      .map((key) => headerStore.get(key)?.toUpperCase())
      .find((val) => val && map.has(val)) ?? null;
  const acceptLanguage = parseAcceptLanguage(headerStore.get("accept-language"));

  const orderedCandidates = [
    stored,
    headerDetected,
    acceptLanguage,
    locale === "ru" ? "RU" : "US",
  ];

  for (const candidate of orderedCandidates) {
    if (candidate && map.has(candidate)) {
      const seed = map.get(candidate)!;
      return toCountryDTO(seed, locale);
    }
  }

  return toCountryDTO(availableCountries[0], locale);
};

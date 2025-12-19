import { notFound } from "next/navigation";

import { CountryProvider } from "@/components/providers/country-provider";
import { SiteShell } from "@/components/layout/site-shell";
import { locales } from "@/lib/config/site";
import type { Locale } from "@/lib/config/site";
import type { CountryDefaults } from "@/lib/constants/countries";
import { getCountries } from "@/lib/server/calculators";
import type { CountryProfileDTO } from "@/types/country";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  const normalizedLocale = locale as Locale;

  const countriesRaw = await getCountries();

  const countries: CountryProfileDTO[] = countriesRaw.map((country) => ({
    countryCode: country.countryCode,
    name: country.nameEn,
    nameLocalized: normalizedLocale === "ru" ? country.nameRu : country.nameEn,
    unitSystem: country.unitSystem as CountryProfileDTO["unitSystem"],
    currency: country.currency,
    defaults: country.defaults as CountryDefaults,
  }));

  // Use default country for static generation (country detection happens on client)
  const initialCountry =
    countries.find((item) => item.countryCode === (normalizedLocale === "ru" ? "RU" : "US")) ??
    countries[0];

  return (
    <CountryProvider countries={countries} initialCountry={initialCountry}>
      <SiteShell locale={normalizedLocale}>{children}</SiteShell>
    </CountryProvider>
  );
}



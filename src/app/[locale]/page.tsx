import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogExplorer } from "@/components/catalog/catalog-explorer";
import { StructuredData } from "@/lib/seo/structured-data";
import type { Locale } from "@/lib/config/site";
import { locales } from "@/lib/config/site";
import { generateCatalogMetadata } from "@/lib/seo/metadata";
import { getDictionary } from "@/lib/i18n";
import { getCalculators } from "@/lib/server/calculators";
import { popularCalculatorSlugs } from "@/lib/content/relations";
import { CalculatorCard } from "@/components/catalog/calculator-card";
import { categoryMeta } from "@/components/catalog/catalog-explorer";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Record<string, string | string[] | undefined>;
};

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) {
    return generateCatalogMetadata("en", "/en");
  }
  return generateCatalogMetadata(locale as Locale, `/${locale}`);
}

export default async function LocaleHome({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const normalizedLocale = locale as Locale;
  const dict = getDictionary(normalizedLocale);
  const calculators = await getCalculators(normalizedLocale);

  // Get popular calculators
  const popularCalculators = calculators
    .filter((calc) => popularCalculatorSlugs.includes(calc.slug))
    .sort((a, b) => {
      const aIndex = popularCalculatorSlugs.indexOf(a.slug);
      const bIndex = popularCalculatorSlugs.indexOf(b.slug);
      return aIndex - bIndex;
    })
    .slice(0, 8);

  return (
    <>
      <StructuredData type="webapp" locale={normalizedLocale} />
      
      {/* Popular Calculators Section */}
      {popularCalculators.length > 0 && (
        <section id="popular" className="mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-2">
              {normalizedLocale === "ru" ? "Популярные калькуляторы" : "Popular Calculators"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {normalizedLocale === "ru"
                ? "Самые востребованные инструменты для расчёта строительных материалов"
                : "Most requested tools for construction material calculations"}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularCalculators.map((calculator) => (
              <CalculatorCard
                key={calculator.id}
                calculator={calculator}
                dictionary={dict}
                locale={normalizedLocale}
                meta={categoryMeta[calculator.category as keyof typeof categoryMeta]}
                isPopular={true}
              />
            ))}
          </div>
        </section>
      )}

      <CatalogExplorer
        calculators={calculators}
        dictionary={dict}
        locale={normalizedLocale}
        searchParams={searchParams}
      />
    </>
  );
}



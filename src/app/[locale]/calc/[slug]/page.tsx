import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CalculatorRunner } from "@/components/calculators/calculator-runner";
import { CalculatorContentSection } from "@/components/content/calculator-content-section";
import { RelatedCalculators } from "@/components/content/related-calculators";
import { StructuredData } from "@/lib/seo/structured-data";
import type { Locale } from "@/lib/config/site";
import { locales } from "@/lib/config/site";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";
import { getDictionary } from "@/lib/i18n";
import { getCalculatorBySlug } from "@/lib/server/calculators";
import { getCalculatorContent } from "@/lib/content/loader";
import { CALCULATOR_DEFINITIONS } from "@/lib/calc/definitions";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Record<string, string | string[] | undefined>;
};

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    CALCULATOR_DEFINITIONS.map((calc) => ({
      locale,
      slug: calc.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) {
    return generateCalculatorMetadata(
      { id: "", title: "", description: "", slug: "", category: "", rating: 0, formulaKey: "", wasteKey: "", inputs: [], faq: [], resultLabels: [], howItWorks: "" },
      "en",
      "/en/calc/unknown",
    );
  }
  const normalizedLocale = locale as Locale;
  const calculator = await getCalculatorBySlug(normalizedLocale, slug);
  if (!calculator) {
    return generateCalculatorMetadata(
      { id: "", title: "", description: "", slug: "", category: "", rating: 0, formulaKey: "", wasteKey: "", inputs: [], faq: [], resultLabels: [], howItWorks: "" },
      normalizedLocale,
      `/${normalizedLocale}/calc/unknown`,
    );
  }
  return generateCalculatorMetadata(calculator, normalizedLocale, `/${normalizedLocale}/calc/${slug}`);
}

export default async function CalculatorPage({
  params,
  searchParams,
}: PageProps) {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  const normalizedLocale = locale as Locale;
  const calculator = await getCalculatorBySlug(normalizedLocale, slug);
  if (!calculator) {
    notFound();
  }
  const dictionary = getDictionary(normalizedLocale);

  const content = await getCalculatorContent(slug, normalizedLocale);
  const calcDefinition = CALCULATOR_DEFINITIONS.find((c) => c.slug === slug);
  
  // Use content FAQ if available (simple format), otherwise fallback to definition FAQ (localized format)
  const faqFromContent = content?.faq || undefined;
  const faqFromDefinition = !faqFromContent && calcDefinition?.faq ? calcDefinition.faq : undefined;

  // Convert content steps to HowTo format if available
  const howToSteps = content?.steps?.map((step) => ({
    name: step.title,
    text: step.description,
  }));

  return (
    <>
      <StructuredData type="breadcrumb" locale={normalizedLocale} calculator={calculator} />
      {faqFromContent && faqFromContent.length > 0 && (
        <StructuredData type="faq" locale={normalizedLocale} faqFromContent={faqFromContent} />
      )}
      {faqFromDefinition && faqFromDefinition.length > 0 && (
        <StructuredData type="faq" locale={normalizedLocale} faq={faqFromDefinition} />
      )}
      {howToSteps && howToSteps.length > 0 && (
        <StructuredData
          type="howto"
          locale={normalizedLocale}
          calculator={calculator}
          steps={howToSteps}
        />
      )}
      <CalculatorRunner
        calculator={calculator}
        dictionary={dictionary}
        locale={normalizedLocale}
        searchParams={searchParams}
      />
      {content && (
        <CalculatorContentSection
          content={content}
          locale={normalizedLocale}
          calculator={calculator}
        />
      )}
      <RelatedCalculators currentSlug={slug} locale={normalizedLocale} />
    </>
  );
}



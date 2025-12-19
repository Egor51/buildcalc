import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StructuredData } from "@/lib/seo/structured-data";
import type { Locale } from "@/lib/config/site";
import { locales } from "@/lib/config/site";
import { generateGuideMetadata } from "@/lib/seo/metadata";
import { getDictionary } from "@/lib/i18n";
import { getCalculatorBySlug } from "@/lib/server/calculators";
import { getGuideContent } from "@/lib/content/guide-loader";
import { getRelatedCalculators } from "@/lib/content/loader";
import { getCalculators } from "@/lib/server/calculators";
import { MarkdownRenderer } from "@/components/content/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorCard } from "@/components/catalog/calculator-card";
import { categoryMeta } from "@/components/catalog/catalog-explorer";
import { CALCULATOR_DEFINITIONS } from "@/lib/calc/definitions";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    CALCULATOR_DEFINITIONS
      .filter((calc) => calc.guide) // Only generate for calculators with guides
      .map((calc) => ({
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
    return generateGuideMetadata(
      { id: "", title: "", description: "", slug: "", category: "", rating: 0, formulaKey: "", wasteKey: "", inputs: [], faq: [], resultLabels: [], howItWorks: "" },
      "en",
      "/en/calc/unknown/guide",
    );
  }
  const normalizedLocale = locale as Locale;
  const calculator = await getCalculatorBySlug(normalizedLocale, slug);
  if (!calculator?.guide) {
    return generateGuideMetadata(
      { id: "", title: "", description: "", slug: "", category: "", rating: 0, formulaKey: "", wasteKey: "", inputs: [], faq: [], resultLabels: [], howItWorks: "" },
      normalizedLocale,
      `/${normalizedLocale}/calc/unknown/guide`,
    );
  }
  return generateGuideMetadata(calculator, normalizedLocale, `/${normalizedLocale}/calc/${slug}/guide`);
}

export default async function GuidePage({ params }: PageProps) {
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
  const guideContent = await getGuideContent(slug, normalizedLocale);
  
  // Fallback to calculator.guide if MDX guide doesn't exist
  if (!guideContent && !calculator.guide) {
    notFound();
  }

  // Get related calculators for CTA
  const relatedSlugs = await getRelatedCalculators(slug);
  const allCalculators = await getCalculators(normalizedLocale);
  const relatedCalculators = allCalculators
    .filter((calc) => relatedSlugs.includes(calc.slug))
    .slice(0, 4);

  // Convert guide steps to HowTo format if available
  const howToSteps = guideContent?.headings
    ?.filter((h) => h.level === 2 || h.level === 3)
    .map((heading) => ({
      name: heading.text,
      text: heading.text, // Simplified - in production, extract content under heading
    }));

  return (
    <>
      <StructuredData type="breadcrumb" locale={normalizedLocale} calculator={calculator} isGuide />
      {howToSteps && howToSteps.length > 0 && (
        <StructuredData
          type="howto"
          locale={normalizedLocale}
          calculator={calculator}
          steps={howToSteps}
        />
      )}
      
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            {guideContent?.lastUpdated && (
              <p className="text-xs uppercase text-muted-foreground mb-2">
                {normalizedLocale === "ru" ? "Обновлено" : "Last updated"}:{" "}
                {new Date(guideContent.lastUpdated).toLocaleDateString(normalizedLocale === "ru" ? "ru-RU" : "en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-semibold">
              {guideContent?.title || calculator.title}
            </h1>
            <p className="mt-2 text-base sm:text-lg text-muted-foreground">
              {guideContent?.description || calculator.guide?.intro || calculator.description}
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/${normalizedLocale}/calc/${calculator.slug}`}>
              {normalizedLocale === "ru" ? "← К калькулятору" : "← Back to Calculator"}
            </Link>
          </Button>
        </div>

        {/* Table of Contents */}
        {guideContent?.headings && guideContent.headings.length > 0 && (
          <Card className="border-border/60">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">
                {normalizedLocale === "ru" ? "Содержание" : "Table of Contents"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <nav className="space-y-1.5 sm:space-y-2">
                {guideContent.headings.map((heading, index) => (
                  <a
                    key={index}
                    href={`#${heading.id}`}
                    className={`block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors ${
                      heading.level === 2 ? "font-medium" : heading.level === 3 ? "pl-3 sm:pl-4" : "pl-6 sm:pl-8"
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>
        )}

        {/* Guide Content */}
        <article className="prose prose-sm max-w-none dark:prose-invert">
          {guideContent ? (
            <MarkdownRenderer content={guideContent.content} />
          ) : calculator.guide ? (
            <div className="space-y-4">
              <p className="text-sm sm:text-base leading-7 text-muted-foreground">{calculator.guide.intro}</p>
              {calculator.guide.sections.map((section, index) =>
                section.type === "paragraph" ? (
                  <p key={index} className="text-sm sm:text-base leading-7 text-muted-foreground">
                    {section.body}
                  </p>
                ) : (
                  <ul key={index} className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          ) : null}
        </article>

        {/* CTAs */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">
                {normalizedLocale === "ru" ? "Использовать калькулятор" : "Use Calculator"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                {normalizedLocale === "ru"
                  ? "Примените знания из этого руководства на практике"
                  : "Apply what you learned from this guide"}
              </p>
              <Button asChild className="w-full">
                <Link href={`/${normalizedLocale}/calc/${calculator.slug}`}>
                  {normalizedLocale === "ru" ? "Открыть калькулятор" : "Open Calculator"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {relatedCalculators.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  {normalizedLocale === "ru" ? "Похожие калькуляторы" : "Related Calculators"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-2 sm:space-y-3">
                  {relatedCalculators.map((calc) => (
                    <Button
                      key={calc.id}
                      asChild
                      variant="outline"
                      className="w-full justify-start text-xs sm:text-sm"
                    >
                      <Link href={`/${normalizedLocale}/calc/${calc.slug}`}>
                        {calc.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}



import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/config/site";
import { getRelatedCalculators } from "@/lib/content/loader";
import { getRelatedCalculatorSlugs } from "@/lib/content/relations";
import { getCalculators } from "@/lib/server/calculators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  currentSlug: string;
  locale: Locale;
};

export async function RelatedCalculators({ currentSlug, locale }: Props) {
  // Use the merged getRelatedCalculators which ensures at least 4 links
  const relatedSlugs = await getRelatedCalculators(currentSlug);
  
  if (relatedSlugs.length === 0) return null;

  const allCalculators = await getCalculators(locale);
  const related = allCalculators.filter((calc) => relatedSlugs.includes(calc.slug));

  // Ensure we show at least 4 calculators if available
  if (related.length === 0) return null;
  
  // If we have fewer than 4, try to fill with other calculators
  const finalRelated = related.length >= 4 
    ? related.slice(0, 4)
    : related;

  return (
    <section className="mt-8 sm:mt-12 surface-section">
      <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-semibold">
        {locale === "ru" ? "Похожие калькуляторы" : "Related Calculators"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {finalRelated.map((calc) => (
          <Card key={calc.id} className="border-border/60 hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">{calc.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{calc.description}</p>
              <Button asChild variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                <Link href={`/${locale}/calc/${calc.slug}`}>
                  {locale === "ru" ? "Открыть" : "Open"}
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}


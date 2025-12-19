import Link from "next/link";
import { CheckCircle2, XCircle, Lightbulb, HelpCircle, ArrowRight } from "lucide-react";
import type { CalculatorContent } from "@/lib/content/types";
import type { CalculatorRecord } from "@/lib/server/calculators";
import type { Locale } from "@/lib/config/site";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getCalculators } from "@/lib/server/calculators";

type Props = {
  content: CalculatorContent;
  calculator: CalculatorRecord;
  locale: Locale;
};

export async function CalculatorContentSection({ content, calculator, locale }: Props) {
  // Get all calculators to resolve titles from slugs
  const allCalculators = await getCalculators(locale);
  const calculatorMap = new Map(allCalculators.map(calc => [calc.slug, calc]));
  return (
    <div className="mt-8 sm:mt-12 space-y-8 sm:space-y-10">
      <section className="surface-section">
        <h2 className="mb-4 text-xl sm:text-2xl font-semibold">
          {locale === "ru" ? "О калькуляторе" : "About This Calculator"}
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
          <p className="text-sm sm:text-base leading-relaxed">{content.intro}</p>
        </div>
      </section>

      <section className="surface-section">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-semibold">
          {locale === "ru" ? "Пошаговая инструкция" : "Step-by-Step Instructions"}
        </h2>
        <div className="space-y-3 sm:space-y-4">
          {content.steps.map((step, index) => (
            <Card key={index} className="border-border/60">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Badge variant="outline" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0 flex items-center justify-center text-xs sm:text-sm flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <CardTitle className="text-base sm:text-lg">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
        <section className="surface-section">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-semibold">
              {locale === "ru" ? "Частые ошибки" : "Common Mistakes"}
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {content.commonMistakes.map((item, index) => (
              <div key={index} className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 sm:p-4">
                <p className="font-medium text-sm sm:text-base text-destructive mb-2">{item.mistake}</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.solution}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-section">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-semibold">
              {locale === "ru" ? "Советы профессионалов" : "Pro Tips"}
            </h2>
          </div>
          <ul className="space-y-2 sm:space-y-3">
            {content.proTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 sm:gap-3">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{tip}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {content.faq && content.faq.length > 0 && (
        <section className="surface-section">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-semibold">
              {locale === "ru" ? "Часто задаваемые вопросы" : "Frequently Asked Questions"}
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {content.faq.map((item, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-sm sm:text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {content.relatedCalculators && content.relatedCalculators.length > 0 && (
        <section className="surface-section">
          <h2 className="mb-4 text-xl sm:text-2xl font-semibold">
            {locale === "ru" ? "Связанные калькуляторы" : "Related Calculators"}
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {content.relatedCalculators.map((relatedSlug) => {
              const relatedCalc = calculatorMap.get(relatedSlug);
              const displayName = relatedCalc?.title || relatedSlug;
              return (
                <Link
                  key={relatedSlug}
                  href={`/${locale}/calc/${relatedSlug}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {displayName}
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}


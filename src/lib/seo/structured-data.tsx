import type { Locale } from "@/lib/config/site";
import type { CalculatorRecord } from "@/lib/server/calculators";
import type { CalculatorFaq } from "@/lib/calc/types";
import {
  generateWebApplicationSchema,
  generateFAQPageSchema,
  generateFAQPageSchemaFromContent,
  generateBreadcrumbSchema,
  generateHowToSchema,
} from "./schema";

type StructuredDataProps = {
  type: "webapp" | "faq" | "breadcrumb" | "howto";
  locale: Locale;
  calculator?: CalculatorRecord;
  faq?: CalculatorFaq[];
  faqFromContent?: Array<{ question: string; answer: string }>;
  steps?: Array<{ name: string; text: string }>;
  isGuide?: boolean;
};

export function StructuredData({
  type,
  locale,
  calculator,
  faq,
  faqFromContent,
  steps,
  isGuide,
}: StructuredDataProps) {
  let schema: object;

  switch (type) {
    case "webapp":
      schema = generateWebApplicationSchema(locale);
      break;
    case "faq":
      // Prefer content layer FAQ if available, otherwise use localized FAQ
      if (faqFromContent && faqFromContent.length > 0) {
        schema = generateFAQPageSchemaFromContent(faqFromContent);
      } else if (faq && faq.length > 0) {
        schema = generateFAQPageSchema(faq, locale);
      } else {
        return null;
      }
      break;
    case "breadcrumb":
      if (!calculator) return null;
      schema = generateBreadcrumbSchema(calculator, locale, isGuide);
      break;
    case "howto":
      if (!calculator || !steps) return null;
      schema = generateHowToSchema(calculator, steps, locale);
      break;
    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}


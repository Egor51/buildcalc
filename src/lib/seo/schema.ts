import type { Locale } from "@/lib/config/site";
import { siteConfig } from "@/lib/config/site";
import type { CalculatorRecord } from "@/lib/server/calculators";
import type { CalculatorFaq } from "@/lib/calc/types";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://buildcalc.local";

export function generateWebApplicationSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": siteConfig.name,
    "description": locale === "ru"
      ? "Онлайн-калькуляторы для расчёта строительных материалов"
      : "Online calculators for construction material estimation",
    "url": baseUrl,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "ratingCount": "1000",
    },
  };
}

/**
 * Generate FAQPage schema from CalculatorFaq (localized format)
 */
export function generateFAQPageSchema(
  faq: CalculatorFaq[],
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map((item) => ({
      "@type": "Question",
      "name": locale === "ru" ? item.question.ru : item.question.en,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": locale === "ru" ? item.answer.ru : item.answer.en,
      },
    })),
  };
}

/**
 * Generate FAQPage schema from content layer FAQ (simple string format)
 */
export function generateFAQPageSchemaFromContent(
  faq: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(
  calculator: CalculatorRecord,
  locale: Locale,
  isGuide = false,
) {
  const items = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": locale === "ru" ? "Главная" : "Home",
      "item": `${baseUrl}/${locale}`,
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": locale === "ru" ? "Калькуляторы" : "Calculators",
      "item": `${baseUrl}/${locale}#catalog`,
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": calculator.title,
      "item": `${baseUrl}/${locale}/calc/${calculator.slug}`,
    },
  ];

  if (isGuide) {
    items.push({
      "@type": "ListItem",
      "position": 4,
      "name": locale === "ru" ? "Руководство" : "Guide",
      "item": `${baseUrl}/${locale}/calc/${calculator.slug}/guide`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items,
  };
}

export function generateHowToSchema(
  calculator: CalculatorRecord,
  steps: Array<{ name: string; text: string }>,
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": locale === "ru"
      ? `Как использовать калькулятор ${calculator.title}`
      : `How to use ${calculator.title} calculator`,
    "description": calculator.description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
    })),
  };
}


import type { Metadata } from "next";
import type { Locale } from "@/lib/config/site";
import { siteConfig } from "@/lib/config/site";
import type { CalculatorRecord } from "@/lib/server/calculators";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://buildcalc.online";

export function getCanonicalUrl(path: string): string {
  return `${baseUrl}${path}`;
}

export function getAlternateLocales(path: string): { [key: string]: string } {
  // Extract locale from path if it exists
  const pathWithoutLocale = path.replace(/^\/(en|ru)/, "");
  return {
    "en": getCanonicalUrl(`/en${pathWithoutLocale}`),
    "ru": getCanonicalUrl(`/ru${pathWithoutLocale}`),
    "x-default": getCanonicalUrl(`/en${pathWithoutLocale}`),
  };
}

/**
 * Generate hreflang alternates for SEO
 * Returns an array of alternate language links
 */
export function getHreflangAlternates(path: string): Array<{ hreflang: string; url: string }> {
  const pathWithoutLocale = path.replace(/^\/(en|ru)/, "");
  return [
    { hreflang: "en", url: getCanonicalUrl(`/en${pathWithoutLocale}`) },
    { hreflang: "ru", url: getCanonicalUrl(`/ru${pathWithoutLocale}`) },
    { hreflang: "x-default", url: getCanonicalUrl(`/en${pathWithoutLocale}`) },
  ];
}

// Helper to extract units from calculator for title enhancement
function getCalculatorUnits(calculator: CalculatorRecord): string {
  const units = calculator.resultLabels
    .map((label) => {
      if (label.metricUnit && label.imperialUnit) {
        return `${label.metricUnit} / ${label.imperialUnit}`;
      }
      return label.siUnit || label.metricUnit || "";
    })
    .filter(Boolean)
    .join(", ");
  return units ? ` (${units})` : "";
}

// Helper to create enhanced title based on calculator type
function getEnhancedTitle(calculator: CalculatorRecord, locale: Locale): string {
  const baseTitle = calculator.title;
  const units = getCalculatorUnits(calculator);
  
  // Special handling for specific calculators
  if (calculator.slug === "paint") {
    return locale === "ru"
      ? `Калькулятор краски — Покрытие, Слои, Запас — ${siteConfig.name}`
      : `Paint Calculator — Coverage, Coats, Waste — ${siteConfig.name}`;
  }
  
  if (calculator.slug === "concrete") {
    return locale === "ru"
      ? `Калькулятор бетона${units} — ${siteConfig.name}`
      : `Concrete Calculator${units} — ${siteConfig.name}`;
  }
  
  // Default enhanced title
  return locale === "ru"
    ? `${baseTitle} — Калькулятор — ${siteConfig.name}`
    : `${baseTitle} Calculator — ${siteConfig.name}`;
}

// Helper to create enhanced description
function getEnhancedDescription(calculator: CalculatorRecord, locale: Locale): string {
  const baseDesc = calculator.description;
  
  if (locale === "ru") {
    return `${baseDesc} Бесплатный онлайн-калькулятор с автоматическим учётом запаса материала, поддержкой метрических и дюймовых единиц. Точные расчёты для строительства.`;
  }
  
  return `${baseDesc} Free online calculator with automatic waste factor, metric and imperial unit support. Accurate construction material estimates.`;
}

export function generateCalculatorMetadata(
  calculator: CalculatorRecord,
  locale: Locale,
  path: string,
): Metadata {
  const title = getEnhancedTitle(calculator, locale);
  const description = getEnhancedDescription(calculator, locale);

  const keywords = locale === "ru"
    ? `${calculator.category}, калькулятор, строительство, материалы, расчёт, онлайн`
    : `${calculator.category}, calculator, construction, materials, estimate, online`;

  const alternates = getAlternateLocales(path);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: getCanonicalUrl(path),
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      alternateLocale: locale === "ru" ? "en_US" : "ru_RU",
      url: getCanonicalUrl(path),
      siteName: siteConfig.name,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
  };
}

export function generateCatalogMetadata(locale: Locale, path: string): Metadata {
  const title = locale === "ru"
    ? `Строительные калькуляторы — ${siteConfig.name}`
    : `Construction Calculators — ${siteConfig.name}`;

  const description = locale === "ru"
    ? "Бесплатные онлайн-калькуляторы для расчёта строительных материалов: бетон, краска, плитка, кровля и другие. Метрические и дюймовые единицы."
    : "Free online calculators for construction materials: concrete, paint, tile, roofing, and more. Metric and imperial units.";

  const alternates = getAlternateLocales(path);

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(path),
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      alternateLocale: locale === "ru" ? "en_US" : "ru_RU",
      url: getCanonicalUrl(path),
      siteName: siteConfig.name,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
  };
}

export function generateGuideMetadata(
  calculator: CalculatorRecord,
  locale: Locale,
  path: string,
): Metadata {
  const title = locale === "ru"
    ? `Руководство: ${calculator.title} — ${siteConfig.name}`
    : `Guide: ${calculator.title} — ${siteConfig.name}`;

  const description = locale === "ru"
    ? `Подробное руководство по использованию калькулятора ${calculator.title}. Пошаговая инструкция, советы и частые ошибки.`
    : `Complete guide for ${calculator.title} calculator. Step-by-step instructions, tips, and common mistakes.`;

  const alternates = getAlternateLocales(path);

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(path),
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      alternateLocale: locale === "ru" ? "en_US" : "ru_RU",
      url: getCanonicalUrl(path),
      siteName: siteConfig.name,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
  };
}


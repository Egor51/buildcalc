import { cache } from "react";

import type { Locale } from "@/lib/config/site";
import type { CalculatorInputField } from "@/lib/calc/types";
import { CALCULATOR_DEFINITIONS } from "@/lib/calc/definitions";
import {
  COUNTRY_PROFILE_SEEDS,
  type CountryProfileSeed,
} from "@/lib/constants/countries";

export type CalculatorInput = Omit<
  CalculatorInputField,
  "label" | "description" | "options"
> & {
  label: string;
  description?: string;
  options?: { value: string; label: string }[];
};

export type CalculatorRecord = {
  id: string;
  slug: string;
  category: string;
  rating: number;
  title: string;
  description: string;
  howItWorks: string;
  inputs: CalculatorInput[];
  faq: Array<{ question: string; answer: string }>;
  guide?: {
    intro: string;
    sections: Array<
      | { type: "paragraph"; body: string }
      | { type: "list"; items: string[] }
    >;
  };
  formulaKey: string;
  resultLabels: Array<{
    id: string;
    label: string;
    siUnit: string;
    metricUnit?: string;
    imperialUnit?: string;
  }>;
  wasteKey: string;
};

const pickLocale = (locale: Locale, en: string, ru: string) =>
  locale === "ru" ? ru : en;

export const getCalculators = cache(async (locale: Locale) => {
  return CALCULATOR_DEFINITIONS.map<CalculatorRecord>((item) => ({
    id: item.slug,
    slug: item.slug,
    category: item.category,
    rating: item.rating,
    title: pickLocale(locale, item.title.en, item.title.ru),
    description: pickLocale(locale, item.description.en, item.description.ru),
    howItWorks: pickLocale(locale, item.howItWorks.en, item.howItWorks.ru),
    inputs: item.inputs.map((input) => ({
      ...input,
      label: pickLocale(locale, input.label.en, input.label.ru),
      description: input.description
        ? pickLocale(locale, input.description.en, input.description.ru)
        : undefined,
      options: input.options?.map((option) => ({
        value: option.value,
        label: pickLocale(locale, option.label.en, option.label.ru),
      })),
    })),
    faq: item.faq.map((faq) => ({
      question: pickLocale(locale, faq.question.en, faq.question.ru),
      answer: pickLocale(locale, faq.answer.en, faq.answer.ru),
    })),
    guide: item.guide
      ? {
          intro: pickLocale(locale, item.guide.intro.en, item.guide.intro.ru),
          sections: item.guide.sections,
        }
      : undefined,
    formulaKey: item.formulaKey,
    resultLabels: item.resultLabels.map((label) => ({
      id: label.id,
      label:
        typeof label.label === "string"
          ? label.label
          : pickLocale(locale, label.label.en, label.label.ru),
      siUnit: label.siUnit,
      metricUnit: label.metricUnit,
      imperialUnit: label.imperialUnit,
    })),
    wasteKey: item.wasteKey,
  }));
});

export const getCalculatorBySlug = cache(
  async (locale: Locale, slug: string) => {
    const calculators = await getCalculators(locale);
    return calculators.find((item) => item.slug === slug) ?? null;
  },
);

export const getCountries = cache(
  async () =>
    COUNTRY_PROFILE_SEEDS.slice().sort((a, b) =>
      a.countryCode.localeCompare(b.countryCode),
    ),
);

export type CountryRecord = CountryProfileSeed;



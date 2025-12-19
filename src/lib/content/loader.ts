import { readFile } from "fs/promises";
import { join } from "path";
import { cache } from "react";
import type { Locale } from "@/lib/config/site";
import type { CalculatorContent } from "./types";
import { getRelatedCalculatorSlugs } from "./relations";

const CONTENT_DIR = join(process.cwd(), "src/content/calculators");

/**
 * Validate calculator content structure
 */
function validateCalculatorContent(data: unknown): data is CalculatorContent {
  if (!data || typeof data !== "object") return false;
  const content = data as Partial<CalculatorContent>;
  
  // Check required fields
  if (typeof content.intro !== "string") return false;
  if (!Array.isArray(content.steps)) return false;
  if (!Array.isArray(content.commonMistakes)) return false;
  if (!Array.isArray(content.proTips)) return false;
  if (!Array.isArray(content.faq)) return false;
  if (!Array.isArray(content.relatedCalculators)) return false;
  
  // Validate steps structure
  if (!content.steps.every(step => 
    typeof step === "object" && 
    typeof step.title === "string" && 
    typeof step.description === "string"
  )) return false;
  
  // Validate commonMistakes structure
  if (!content.commonMistakes.every(mistake => 
    typeof mistake === "object" && 
    typeof mistake.mistake === "string" && 
    typeof mistake.solution === "string"
  )) return false;
  
  // Validate FAQ structure
  if (!content.faq.every(item => 
    typeof item === "object" && 
    typeof item.question === "string" && 
    typeof item.answer === "string"
  )) return false;
  
  return true;
}

async function loadCalculatorContentFile(
  slug: string,
  locale: Locale,
): Promise<CalculatorContent | null> {
  try {
    const filePath = join(CONTENT_DIR, slug, `${locale}.json`);
    const fileContents = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(fileContents);
    
    if (!validateCalculatorContent(parsed)) {
      console.warn(`Invalid content structure for ${slug}/${locale}.json`);
      return null;
    }
    
    return parsed as CalculatorContent;
  } catch (error) {
    // File doesn't exist or is invalid
    if (error instanceof Error && !error.message.includes("ENOENT")) {
      console.warn(`Error loading content for ${slug}/${locale}:`, error);
    }
    return null;
  }
}

/**
 * Get calculator content for a specific slug and locale
 * Returns null if content doesn't exist or is invalid
 */
export const getCalculatorContent = cache(
  async (slug: string, locale: Locale): Promise<CalculatorContent | null> => {
    return loadCalculatorContentFile(slug, locale);
  },
);

/**
 * Get related calculator slugs for a given calculator
 * Merges content-based relations with fallback relations map
 */
export const getRelatedCalculators = cache(
  async (slug: string): Promise<string[]> => {
    const content = await getCalculatorContent(slug, "en");
    const contentRelated = content?.relatedCalculators || [];
    const mapRelated = getRelatedCalculatorSlugs(slug);
    
    // Merge both sources, prefer content, ensure at least 4
    const merged = [...new Set([...contentRelated, ...mapRelated])];
    return merged.length >= 4 ? merged.slice(0, 4) : merged;
  },
);

/**
 * Get FAQ entries for a calculator
 * Returns empty array if no FAQ available
 */
export const getCalculatorFaq = cache(
  async (slug: string, locale: Locale) => {
    const content = await getCalculatorContent(slug, locale);
    return content?.faq || [];
  },
);

/**
 * Get FAQ entries formatted for schema generation
 */
export const getFaqForSchema = cache(
  async (slug: string, locale: Locale) => {
    return getCalculatorFaq(slug, locale);
  },
);


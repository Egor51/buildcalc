import type { MetadataRoute } from "next";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { locales } from "@/lib/config/site";
import { CALCULATOR_DEFINITIONS } from "@/lib/calc/definitions";
import { getCalculatorContent } from "@/lib/content/loader";
import { getGuideContent } from "@/lib/content/guide-loader";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://buildcalc.local";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [];

  // Home pages for each locale
  for (const locale of locales) {
    routes.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  // Calculator pages and guides
  for (const calc of CALCULATOR_DEFINITIONS) {
    for (const locale of locales) {
      // Get content to check lastUpdated
      const content = await getCalculatorContent(calc.slug, locale);
      const lastModified = content?.lastUpdated 
        ? new Date(content.lastUpdated)
        : new Date();

      // Calculator page
      routes.push({
        url: `${baseUrl}/${locale}/calc/${calc.slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      });

      // Guide page - check if MDX guide exists or if calculator has guide
      const guideContent = await getGuideContent(calc.slug, locale);
      const hasGuide = guideContent || calc.guide;
      
      if (hasGuide) {
        const guideLastModified = guideContent?.lastUpdated
          ? new Date(guideContent.lastUpdated)
          : lastModified;

        routes.push({
          url: `${baseUrl}/${locale}/calc/${calc.slug}/guide`,
          lastModified: guideLastModified,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  }

  return routes;
}


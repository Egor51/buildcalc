import { readFile } from "fs/promises";
import { join } from "path";
import { cache } from "react";
import type { Locale } from "@/lib/config/site";
import type { GuideContent } from "./types";

const GUIDES_DIR = join(process.cwd(), "src/content/guides");

/**
 * Extract frontmatter from MDX content
 */
function extractFrontmatter(content: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterText = match[1];
  const body = match[2];

  const frontmatter: Record<string, string> = {};
  const lines = frontmatterText.split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, "");
    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

/**
 * Extract headings from markdown content for TOC
 */
function extractHeadings(content: string): Array<{
  level: number;
  text: string;
  id: string;
}> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string; id: string }> = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Generate ID from heading text (simple slug generation)
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    headings.push({ level, text, id });
  }

  return headings;
}

/**
 * Load guide content from MDX file
 * Returns null if file doesn't exist or is invalid
 */
async function loadGuideFile(
  slug: string,
  locale: Locale,
): Promise<GuideContent | null> {
  try {
    const filePath = join(GUIDES_DIR, slug, `${locale}.mdx`);
    const fileContents = await readFile(filePath, "utf-8");

    const { frontmatter, body } = extractFrontmatter(fileContents);
    const headings = extractHeadings(body);

    // Validate required frontmatter
    if (!frontmatter.title || !frontmatter.description) {
      console.warn(`Missing required frontmatter for ${slug}/${locale}.mdx`);
      return null;
    }

    return {
      title: frontmatter.title,
      description: frontmatter.description,
      lastUpdated: frontmatter.lastUpdated || new Date().toISOString(),
      content: body,
      headings,
    };
  } catch (error) {
    // File doesn't exist or is invalid
    if (error instanceof Error && !error.message.includes("ENOENT")) {
      console.warn(`Error loading guide for ${slug}/${locale}:`, error);
    }
    return null;
  }
}

/**
 * Get guide content for a specific calculator slug and locale
 * Returns null if guide doesn't exist
 */
export const getGuideContent = cache(
  async (slug: string, locale: Locale): Promise<GuideContent | null> => {
    return loadGuideFile(slug, locale);
  },
);

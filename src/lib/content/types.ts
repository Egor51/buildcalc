export type CalculatorContent = {
  intro: string;
  steps: Array<{
    title: string;
    description: string;
  }>;
  commonMistakes: Array<{
    mistake: string;
    solution: string;
  }>;
  proTips: Array<string>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  relatedCalculators: string[]; // slugs
  lastUpdated?: string; // ISO date string
};

export type CalculatorContentMap = {
  [slug: string]: {
    en: CalculatorContent;
    ru: CalculatorContent;
  };
};

export type GuideContent = {
  title: string;
  description: string;
  lastUpdated: string; // ISO date string
  content: string; // MDX content
  videoUrl?: string; // Optional YouTube video URL
  headings?: Array<{
    level: number;
    text: string;
    id: string;
  }>;
};


export type LocalizedString = {
  en: string;
  ru: string;
};

export type UnitKind =
  | "length"
  | "width"
  | "height"
  | "thickness"
  | "diameter"
  | "area"
  | "volume"
  | "angle"
  | "count"
  | "coverage"
  | "percent";

export type CalculatorInputField = {
  id: string;
  kind: "number" | "select" | "toggle";
  label: LocalizedString;
  description?: LocalizedString;
  unitKind?: UnitKind;
  min?: number;
  max?: number;
  step?: number;
  defaultMetric?: number | string | boolean;
  defaultImperial?: number | string | boolean;
  options?: { value: string; label: LocalizedString }[];
  group?: string;
};

export type CalculatorFaq = {
  question: LocalizedString;
  answer: LocalizedString;
};

export type GuideSection =
  | {
      type: "paragraph";
      body: string;
    }
  | {
    type: "list";
    items: string[];
  };

export type CalculatorDefinition = {
  slug: string;
  category:
    | "concrete"
    | "paint"
    | "flooring"
    | "tile"
    | "roofing"
    | "drywall"
    | "wallpaper"
    | "brick"
    | "insulation"
    | "plaster"
    | "screed"
    | "electrical";
  rating: number;
  title: LocalizedString;
  description: LocalizedString;
  formulaKey:
    | "concrete"
    | "paint"
    | "flooring"
    | "tile"
    | "roofing"
    | "drywall"
    | "wallpaper"
    | "brick"
    | "insulation"
    | "plaster"
    | "screed"
    | "electrical";
  inputs: CalculatorInputField[];
  howItWorks: LocalizedString;
  faq: CalculatorFaq[];
  guide?: {
    intro: LocalizedString;
    sections: GuideSection[];
  };
  wasteKey: string;
  resultLabels: {
    id: string;
    label: LocalizedString;
    siUnit: string;
    metricUnit?: string;
    imperialUnit?: string;
  }[];
};



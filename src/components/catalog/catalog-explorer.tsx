"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Blocks,
  Bolt,
  BrickWall,
  Cable,
  Hammer,
  Layers,
  Paintbrush2,
  PanelsTopLeft,
  Ruler,
  SwatchBook,
  Waves,
} from "lucide-react";

import { CountrySelect } from "@/components/country-select";
import { CalculatorCard, CalculatorCardSkeleton } from "@/components/catalog/calculator-card";
import { useCountry } from "@/components/providers/country-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Locale } from "@/lib/config/site";
import type { Dictionary } from "@/lib/i18n";
import type { CalculatorRecord } from "@/lib/server/calculators";

const metricPreferred = new Set(["tile", "wallpaper", "brick", "paint", "insulation", "plaster", "screed", "electrical"]);
const imperialPreferred = new Set(["concrete", "roofing", "drywall", "flooring"]);

const SECTION_BLUEPRINT = [
  {
    id: "structural",
    categories: new Set(["concrete", "roofing", "brick", "screed"]),
  },
  {
    id: "finishing",
    categories: new Set(["paint", "tile", "plaster", "wallpaper"]),
  },
  {
    id: "interior",
    categories: new Set(["flooring", "drywall", "insulation", "electrical"]),
  },
];

export const categoryMeta = {
  concrete: { icon: Hammer, gradient: "from-amber-500/20 via-amber-500/10 to-transparent", accent: "text-amber-500" },
  roofing: { icon: Waves, gradient: "from-sky-500/20 via-sky-500/10 to-transparent", accent: "text-sky-500" },
  brick: { icon: BrickWall, gradient: "from-orange-500/20 via-orange-500/10 to-transparent", accent: "text-orange-500" },
  screed: { icon: Layers, gradient: "from-stone-500/20 via-stone-500/10 to-transparent", accent: "text-stone-500" },
  paint: { icon: Paintbrush2, gradient: "from-rose-500/20 via-rose-500/10 to-transparent", accent: "text-rose-500" },
  tile: { icon: PanelsTopLeft, gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent", accent: "text-emerald-500" },
  plaster: { icon: SwatchBook, gradient: "from-purple-500/20 via-purple-500/10 to-transparent", accent: "text-purple-500" },
  wallpaper: { icon: Blocks, gradient: "from-fuchsia-500/20 via-fuchsia-500/10 to-transparent", accent: "text-fuchsia-500" },
  flooring: { icon: Ruler, gradient: "from-blue-500/20 via-blue-500/10 to-transparent", accent: "text-blue-500" },
  drywall: { icon: Layers, gradient: "from-slate-500/20 via-slate-500/10 to-transparent", accent: "text-slate-500" },
  insulation: { icon: Bolt, gradient: "from-lime-500/20 via-lime-500/10 to-transparent", accent: "text-lime-500" },
  electrical: { icon: Cable, gradient: "from-indigo-500/20 via-indigo-500/10 to-transparent", accent: "text-indigo-500" },
} as const;

type Props = {
  calculators: CalculatorRecord[];
  dictionary: Dictionary;
  locale: Locale;
  searchParams: Record<string, string | string[] | undefined>;
};

export const CatalogExplorer = ({
  calculators,
  dictionary,
  locale,
  searchParams,
}: Props) => {
  const { country } = useCountry();
  const [search, setSearch] = useState(
    typeof searchParams.q === "string" ? searchParams.q : "",
  );
  const [category, setCategory] = useState(
    typeof searchParams.category === "string" ? searchParams.category : "all",
  );
  const [unitFilter, setUnitFilter] = useState<string>(
    typeof searchParams.units === "string" ? searchParams.units : "auto",
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  const popularSet = useMemo(() => {
    // Use first 3 calculators as popular (no rating-based sorting)
    return new Set(
      calculators
        .slice(0, 3)
        .map((calc) => calc.slug),
    );
  }, [calculators]);

  const categories = useMemo(
    () => Array.from(new Set(calculators.map((calc) => calc.category))),
    [calculators],
  );

  const filtered = useMemo(() => {
    return calculators.filter((calc) => {
      const matchesSearch =
        search.trim().length === 0 ||
        calc.title.toLowerCase().includes(search.toLowerCase()) ||
        calc.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === "all" || calc.category === category;
      const matchesUnit =
        unitFilter === "auto" ||
        (unitFilter === "metric" && metricPreferred.has(calc.category)) ||
        (unitFilter === "imperial" && imperialPreferred.has(calc.category));
      return matchesSearch && matchesCategory && matchesUnit;
    });
  }, [calculators, search, category, unitFilter]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setUnitFilter("auto");
  };

  const sections = SECTION_BLUEPRINT.map((section) => {
    const localized = dictionary.home.sections[section.id as keyof typeof dictionary.home.sections];
    return {
      id: section.id,
      title: localized.title,
      description: localized.description,
      calculators: filtered.filter((calc) => section.categories.has(calc.category)),
    };
  });

  return (
    <section className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-background to-background p-6 shadow-lg sm:p-10">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-grid-soft opacity-40 lg:block" />
        <div className="relative grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Badge className="text-xs uppercase tracking-widest" variant="secondary">
              BuildCalc · {country.nameLocalized}
            </Badge>
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {dictionary.home.heroTitle}
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                {dictionary.home.heroSubtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="#catalog">{dictionary.home.heroCtaPrimary}</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#popular">{dictionary.home.heroCtaSecondary}</a>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 rounded-2xl border border-border/40 bg-card/70 p-4 sm:grid-cols-3">
            <div>
              <p className="text-2xl font-semibold text-primary">
                {calculators.length.toString().padStart(2, "0")}
              </p>
              <p className="text-sm text-muted-foreground">{dictionary.home.heroStatProjects}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-primary">
                {country.defaults ? "05+" : "05"}
              </p>
              <p className="text-sm text-muted-foreground">{dictionary.home.heroStatCountries}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-primary">2</p>
              <p className="text-sm text-muted-foreground">{dictionary.home.heroStatCoverage}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-section" id="filters">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Label htmlFor="search" className="text-xs font-medium sm:text-sm">
              {dictionary.filters.search}
            </Label>
            <Input
              id="search"
              placeholder={dictionary.filters.search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="mt-2 h-10"
            />
          </div>
          <div>
            <Label className="text-xs font-medium sm:text-sm">
              {dictionary.filters.category}
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium sm:text-sm">
              {dictionary.filters.unitSystem}
            </Label>
            <Select value={unitFilter} onValueChange={setUnitFilter}>
              <SelectTrigger className="mt-2 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  Auto ({country.unitSystem})
                </SelectItem>
                <SelectItem value="metric">{dictionary.filters.unitMetric}</SelectItem>
                <SelectItem value="imperial">{dictionary.filters.unitImperial}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:w-auto sm:flex-1 sm:max-w-xs">
            <Label className="text-xs font-medium sm:text-sm">
              {dictionary.filters.country}
            </Label>
            <div className="mt-2">
              <CountrySelect showIcon={false} triggerClassName="w-full h-10" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {dictionary.home.manualOverride}
            </p>
          </div>
          <Button
            variant="ghost"
            className="h-10 self-start sm:self-end"
            onClick={resetFilters}
          >
            {dictionary.filters.clear}
          </Button>
        </div>
      </div>

      <div id="catalog">
        {hydrated ? (
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id === "structural" ? "popular" : undefined}>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{section.id}</p>
                    <h2 className="text-2xl font-semibold">{section.title}</h2>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                {section.calculators.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center text-muted-foreground">
                    {dictionary.home.emptyState}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {section.calculators.map((calculator) => (
                      <CalculatorCard
                        key={calculator.id}
                        calculator={calculator}
                        dictionary={dictionary}
                        locale={locale}
                        meta={categoryMeta[calculator.category as keyof typeof categoryMeta]}
                        isPopular={popularSet.has(calculator.slug)}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CalculatorCardSkeleton key={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};



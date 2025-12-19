"use client";

import { useCallback, startTransition, useLayoutEffect, useMemo, useState, type ComponentProps } from "react";

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
  Search,
  Sparkles,
  SwatchBook,
  Waves,
} from "lucide-react";

import { CalculatorCard, CalculatorCardSkeleton } from "@/components/catalog/calculator-card";
import { useFavorites } from "@/components/catalog/use-favorites";
import { useCountry } from "@/components/providers/country-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/lib/config/site";
import type { Dictionary } from "@/lib/i18n";
import type { CalculatorRecord } from "@/lib/server/calculators";

const metricPreferred = new Set([
  "tile",
  "wallpaper",
  "brick",
  "paint",
  "insulation",
  "plaster",
  "screed",
  "electrical",
]);
const imperialPreferred = new Set([
  "concrete",
  "roofing",
  "drywall",
  "flooring",
]);

const FAST_CATEGORIES = new Set(["paint", "tile", "flooring", "wallpaper", "drywall"]);

const SECTION_FILTERS = [
  {
    id: "all",
    title: { en: "All scopes", ru: "Все работы" },
    description: { en: "Show every calculator", ru: "Показать все калькуляторы" },
    categories: null,
  },
  {
    id: "structural",
    title: { en: "Structure", ru: "Фундамент" },
    description: { en: "Concrete, roofing, brick", ru: "Бетон, кровля, кирпич" },
    categories: new Set(["concrete", "roofing", "brick", "screed"]),
  },
  {
    id: "finishing",
    title: { en: "Finishing", ru: "Отделка" },
    description: { en: "Paint, tile, plaster, wallpaper", ru: "Краска, плитка, штукатурка" },
    categories: new Set(["paint", "tile", "plaster", "wallpaper"]),
  },
  {
    id: "interior",
    title: { en: "Interior", ru: "Интерьер" },
    description: { en: "Flooring, drywall, insulation, electrical", ru: "Полы, гипсокартон, электрика" },
    categories: new Set(["flooring", "drywall", "insulation", "electrical"]),
  },
] as const;

type SectionFilterId = (typeof SECTION_FILTERS)[number]["id"];

type SortOption = "popular" | "newest" | "rating";

type QuickFilter = "all" | "popular" | "new" | "precise" | "fast" | "favorites";

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

export const CatalogExplorer = ({ calculators, dictionary, locale, searchParams }: Props) => {
  const { country } = useCountry();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const [search, setSearch] = useState(typeof searchParams.q === "string" ? searchParams.q : "");
  const [category, setCategory] = useState(typeof searchParams.category === "string" ? searchParams.category : "all");
  const [segment, setSegment] = useState<SectionFilterId>("all");
  const [unitFilter, setUnitFilter] = useState<string>(typeof searchParams.units === "string" ? searchParams.units : "auto");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [sort, setSort] = useState<SortOption>("popular");
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    startTransition(() => {
      setHydrated(true);
    });
  }, []);

  const popularSet = useMemo(() => new Set(calculators.slice(0, 3).map((calc) => calc.slug)), [calculators]);
  const recentSet = useMemo(() => new Set(calculators.slice(-4).map((calc) => calc.slug)), [calculators]);
  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const orderIndex = useMemo(() => {
    const index = new Map<string, number>();
    calculators.forEach((calc, idx) => index.set(calc.slug, idx));
    return index;
  }, [calculators]);

  const matchesSegment = useCallback(
    (calc: CalculatorRecord) => {
      if (segment === "all") return true;
      const section = SECTION_FILTERS.find((item) => item.id === segment);
      if (!section?.categories) return true;
      return section.categories.has(calc.category);
    },
    [segment],
  );

  const matchesQuickFilter = useCallback(
    (calc: CalculatorRecord) => {
      switch (quickFilter) {
        case "popular":
          return popularSet.has(calc.slug);
        case "new":
          return recentSet.has(calc.slug);
        case "precise":
          return calc.rating >= 4.8;
        case "fast":
          return FAST_CATEGORIES.has(calc.category);
        case "favorites":
          return favoritesSet.has(calc.slug);
        default:
          return true;
      }
    },
    [favoritesSet, popularSet, quickFilter, recentSet],
  );

  const filtered = useMemo(() => {
    return calculators.filter((calc) => {
      const matchesSearch =
        search.trim().length === 0 ||
        calc.title.toLowerCase().includes(search.toLowerCase()) ||
        calc.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || calc.category === category;
      const matchesUnit =
        unitFilter === "auto" ||
        (unitFilter === "metric" && metricPreferred.has(calc.category)) ||
        (unitFilter === "imperial" && imperialPreferred.has(calc.category));

      return matchesSearch && matchesCategory && matchesUnit && matchesSegment(calc) && matchesQuickFilter(calc);
    });
  }, [calculators, category, matchesQuickFilter, matchesSegment, search, unitFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === "popular") {
        const aPopular = popularSet.has(a.slug) ? 1 : 0;
        const bPopular = popularSet.has(b.slug) ? 1 : 0;
        if (aPopular !== bPopular) return bPopular - aPopular;
        return b.rating - a.rating;
      }
      if (sort === "newest") {
        return (orderIndex.get(b.slug) ?? 0) - (orderIndex.get(a.slug) ?? 0);
      }
      return b.rating - a.rating;
    });
  }, [filtered, orderIndex, popularSet, sort]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setSegment("all");
    setQuickFilter("all");
    setUnitFilter("auto");
    setSort("popular");
  };

  const heroCtaPrimary = dictionary.home.heroCtaPrimary;
  const heroCtaSecondary = dictionary.home.heroCtaSecondary;

  return (
    <section className="space-y-8 sm:space-y-12 lg:space-y-14">
      <div className="relative overflow-hidden rounded-[40px] border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-10 shadow-[0_25px_80px_rgba(17,19,27,0.12)]">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-grid-soft opacity-40 lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Badge variant="glass" className="text-xs uppercase tracking-widest">
              BuildCalc · {country.nameLocalized}
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[44px]">
                {dictionary.home.heroTitle}
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                {dictionary.home.heroSubtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="#catalog">{heroCtaPrimary}</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#filters">{heroCtaSecondary}</a>
              </Button>
            </div>
          </div>
          <div className="rounded-[28px] border border-border/40 bg-card/80 p-4 shadow-card-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
              {locale === "ru" ? "Быстрый поиск" : "Quick search"}
            </p>
            <div className="mt-3">
              <Label htmlFor="hero-search" className="sr-only">
                {dictionary.filters.search}
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="hero-search"
                  placeholder={dictionary.filters.search}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-11 pr-12"
                />
                {search ? (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setSearch("")}
                  >
                    {locale === "ru" ? "Очистить" : "Clear"}
                  </button>
                ) : null}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-3xl font-semibold text-primary">{calculators.length.toString().padStart(2, "0")}</p>
                <p className="text-muted-foreground">{dictionary.home.heroStatProjects}</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-secondary">{country.defaults ? "05+" : "05"}</p>
                <p className="text-muted-foreground">{dictionary.home.heroStatCountries}</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-foreground">2</p>
                <p className="text-muted-foreground">{dictionary.home.heroStatCoverage}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="catalog" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{locale === "ru" ? "Каталог" : "Catalog"}</p>
            <h2 className="text-2xl font-semibold">{dictionary.home.sections.structural.title}</h2>
            <p className="text-sm text-muted-foreground">{locale === "ru" ? "Отбор по вашим параметрам" : "Tailored recommendations"}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            {locale === "ru" ? "Мгновенная фильтрация и избранное" : "Instant filtering & favorites"}
          </div>
        </div>
        {hydrated ? (
          sorted.length > 0 ? (
            <div className="card-grid-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sorted.map((calculator) => {
                const badges = [] as Array<{ id: string; label: string; variant?: ComponentProps<typeof Badge>["variant"] }>;
                if (recentSet.has(calculator.slug)) {
                  badges.push({ id: "new", label: locale === "ru" ? "Новый" : "New", variant: "electric" });
                }
                if (calculator.rating >= 4.8) {
                  badges.push({ id: "precise", label: locale === "ru" ? "Точный" : "Precise", variant: "brand" });
                }
                if (FAST_CATEGORIES.has(calculator.category)) {
                  badges.push({ id: "fast", label: locale === "ru" ? "Быстрый" : "Fast", variant: "muted" });
                }

                return (
                  <CalculatorCard
                    key={calculator.id}
                    calculator={calculator}
                    dictionary={dictionary}
                    locale={locale}
                    meta={categoryMeta[calculator.category as keyof typeof categoryMeta]}
                    isPopular={popularSet.has(calculator.slug)}
                    badges={badges}
                    isFavorite={isFavorite(calculator.slug)}
                    onFavorite={toggleFavorite}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border/70 bg-card/70 px-6 py-12 text-center text-muted-foreground">
              <Search className="h-10 w-10 text-primary" aria-hidden />
              <p className="mt-4 text-lg font-semibold text-foreground">
                {locale === "ru" ? "Ничего не найдено" : "No calculators found"}
              </p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {locale === "ru"
                  ? "Попробуйте изменить фильтры или сбросьте поиск, чтобы увидеть больше калькуляторов."
                  : "Try adjusting filters or reset search to discover more calculators."}
              </p>
              <Button className="mt-4" variant="outline" onClick={resetFilters}>
                {dictionary.filters.clear}
              </Button>
            </div>
          )
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

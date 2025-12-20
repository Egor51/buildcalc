"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Box,
  CopyIcon,
  Download,
  Gauge,
  Info,
  Layers,
  Percent,
  Ruler,
  Settings2,
  ShieldCheck,
  Sparkles,
  Share2,
  Square,
  BookOpen,
} from "lucide-react";

import { useCountry } from "@/components/providers/country-provider";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/config/site";
import type { Dictionary } from "@/lib/i18n";
import type { CalculatorRecord } from "@/lib/server/calculators";
import { runCalculation } from "@/lib/calc/engine";
import type { FormulaKey } from "@/lib/calc/engine";
import type { CountryDefaults, UnitSystem } from "@/lib/constants/countries";
import { sqmToUserArea, metersToUserLength, litersToUserVolume, cubicMetersToUserVolume } from "@/lib/calc/conversions";
import { formatNumber } from "@/lib/units/format";

type Props = {
  calculator: CalculatorRecord;
  dictionary: Dictionary;
  locale: Locale;
  searchParams: Record<string, string | string[] | undefined>;
};


const determineCountryDefault = (
  fieldId: string,
  countryDefaults: CountryDefaults,
  unitSystem: UnitSystem,
) => {
  switch (fieldId) {
    case "coverage": {
      const metric = countryDefaults.paint.coverageSqmPerLiter;
      if (unitSystem === "imperial") {
        return (metric / 0.092903) * 3.78541;
      }
      return metric;
    }
    case "packCoverage":
      return unitSystem === "imperial"
        ? countryDefaults.flooring.packCoverageSqm / 0.092903
        : countryDefaults.flooring.packCoverageSqm;
    case "bundleCoverage":
      return unitSystem === "imperial"
        ? countryDefaults.roofing.bundleCoverageSqm / 0.092903
        : countryDefaults.roofing.bundleCoverageSqm;
    case "sheetArea":
      return unitSystem === "imperial"
        ? countryDefaults.drywall.sheetAreaSqm / 0.092903
        : countryDefaults.drywall.sheetAreaSqm;
    case "rollLength":
      return unitSystem === "imperial"
        ? countryDefaults.wallpaper.rollLengthMeters / 0.3048
        : countryDefaults.wallpaper.rollLengthMeters;
    case "rollWidth":
      return unitSystem === "imperial"
        ? countryDefaults.wallpaper.rollWidthMeters / 0.3048
        : countryDefaults.wallpaper.rollWidthMeters;
    case "allowance":
      return unitSystem === "imperial"
        ? countryDefaults.wallpaper.allowanceMeters / 0.3048
        : countryDefaults.wallpaper.allowanceMeters;
    case "bricksPerSqm":
      return countryDefaults.brick.bricksPerSqm;
    case "mortarPerSqm":
      return countryDefaults.brick.mortarPerSqm;
    default:
      return undefined;
  }
};

const unitKindIcons: Record<string, LucideIcon> = {
  length: Ruler,
  width: Ruler,
  height: Ruler,
  thickness: Ruler,
  diameter: Ruler,
  area: Square,
  volume: Box,
  coverage: Layers,
  percent: Percent,
  angle: Gauge,
  default: Settings2,
};

const unitLabelFor = (unitSystem: UnitSystem, unitKind?: string) => {
  if (!unitKind) return "";
  if (["length", "width", "height", "thickness", "diameter"].includes(unitKind)) {
    return unitSystem === "imperial" ? "ft" : "m";
  }
  if (unitKind === "area") {
    return unitSystem === "imperial" ? "ft²" : "m²";
  }
  if (unitKind === "coverage") {
    return unitSystem === "imperial" ? "ft²/gal" : "m²/L";
  }
  if (unitKind === "percent") {
    return "%";
  }
  if (unitKind === "angle") {
    return "°";
  }
  if (unitKind === "volume") {
    return unitSystem === "imperial" ? "yd³" : "m³";
  }
  return "";
};

const convertSiUnitToUser = (
  unitSystem: UnitSystem,
  siUnit: string,
  value: number,
) => {
  if (siUnit.includes("m²")) {
    return sqmToUserArea(value, unitSystem);
  }
  if (siUnit.includes("m³")) {
    return cubicMetersToUserVolume(value, unitSystem);
  }
  if (siUnit === "L") {
    return litersToUserVolume(value, unitSystem);
  }
  if (siUnit === "m") {
    return metersToUserLength(value, unitSystem);
  }
  return value;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const PRESETS = [
  {
    id: "eco",
    label: { en: "Economy", ru: "Эконом" },
    description: {
      en: "Reduces defaults by 15% with lower waste.",
      ru: "Уменьшает значения на 15% и снижает запас.",
    },
    multiplier: 0.85,
    wasteAdjustment: -0.02,
  },
  {
    id: "standard",
    label: { en: "Standard", ru: "Типовой" },
    description: {
      en: "Balanced values for most projects.",
      ru: "Сбалансированные параметры для большинства проектов.",
    },
    multiplier: 1,
    wasteAdjustment: 0,
  },
  {
    id: "premium",
    label: { en: "Premium", ru: "Премиум" },
    description: {
      en: "Boosts coverage with extra 15% reserves.",
      ru: "Увеличивает объём и добавляет 15% запаса.",
    },
    multiplier: 1.15,
    wasteAdjustment: 0.03,
  },
] as const;

type PresetId = (typeof PRESETS)[number]["id"];

export const CalculatorRunner = ({
  calculator,
  dictionary,
  locale,
  searchParams,
}: Props) => {
  const { country } = useCountry();
  const [unitTab, setUnitTab] = useState<"user" | "si">("user");
  const baseWaste =
    country.defaults.waste[calculator.wasteKey] ?? country.defaults.waste.concrete ?? 0.08;
  const [waste, setWaste] = useState<number>(
    typeof searchParams.waste === "string"
      ? Number(searchParams.waste) / 100
      : baseWaste,
  );
  const [copied, setCopied] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetId>("standard");

  const initialValues = useMemo(() => {
    const values: Record<string, string | number | boolean> = {};
    calculator.inputs.forEach((field) => {
      const queryValue = searchParams[field.id];
      if (typeof queryValue === "string") {
        if (field.kind === "toggle") {
          values[field.id] = queryValue === "true";
        } else {
          values[field.id] = queryValue;
        }
        return;
      }
      const override = determineCountryDefault(
        field.id,
        country.defaults,
        country.unitSystem,
      );
      if (override !== undefined) {
        values[field.id] = override;
        return;
      }
      if (field.kind === "toggle") {
        values[field.id] =
          country.unitSystem === "imperial"
            ? field.defaultImperial ?? false
            : field.defaultMetric ?? false;
      } else {
        const defaultVal =
          country.unitSystem === "imperial"
            ? field.defaultImperial
            : field.defaultMetric;
        values[field.id] = defaultVal ?? "";
      }
    });
    return values;
  }, [calculator.inputs, country.defaults, country.unitSystem, searchParams]);

  const [values, setValues] = useState(initialValues);
  const [isUpdating, startTransition] = useTransition();

  const updateField = (fieldId: string, nextValue: string | number | boolean) => {
    startTransition(() => {
      setValues((prev) => ({
        ...prev,
        [fieldId]: nextValue,
      }));
    });
  };

  const modeValue = values.mode;
  const visibleInputs = calculator.inputs.filter((field) => {
    if (!field.group) return true;
    return modeValue === field.group;
  });

  const numericInputs: Record<string, number | string | boolean> = {};
  calculator.inputs.forEach((field) => {
    const current = values[field.id];
    if (field.kind === "number") {
      numericInputs[field.id] = Number(current);
    } else {
      numericInputs[field.id] = current ?? "";
    }
  });

  const engineResult = runCalculation({
    formulaKey: calculator.formulaKey as FormulaKey,
    inputs: numericInputs,
    unitSystem: country.unitSystem,
    defaults: country.defaults,
    wasteFactor: waste,
  });

  // Helper to get pack unit label
  const getPackUnitLabel = (packType: string, locale: Locale): string => {
    const packUnits: Record<string, { en: string; ru: string }> = {
      packs: { en: "packs", ru: "пачек" },
      bundles: { en: "bundles", ru: "пачек" },
      rolls: { en: "rolls", ru: "рулонов" },
      sheets: { en: "sheets", ru: "листов" },
    };
    return packUnits[packType]?.[locale] ?? "";
  };

  // Find pack/bundle/roll/sheet count from engine result
  const findPackInfo = () => {
    const packTypes = ["packs", "bundles", "rolls", "sheets"];
    for (const packType of packTypes) {
      if (engineResult[packType] !== undefined) {
        return {
          count: engineResult[packType],
          unit: getPackUnitLabel(packType, locale),
          type: packType,
        };
      }
    }
    return null;
  };

  const resultRows = calculator.resultLabels.map((label) => {
    const siValue = engineResult[label.id] ?? 0;
    const userValue = convertSiUnitToUser(
      country.unitSystem,
      label.siUnit,
      siValue,
    );
    const userUnit =
      country.unitSystem === "imperial"
        ? label.imperialUnit ?? label.siUnit
        : label.metricUnit ?? label.siUnit;
    
    // Check if there's pack info for this calculator (show it with area/volume results)
    const packInfo = (label.id === "area" || label.id === "volume") 
      ? findPackInfo() 
      : null;

    return {
      ...label,
      siValue,
      userValue,
      userUnit,
      packInfo,
    };
  });

  const buildShareUrl = () => {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === "") return;
      params.set(key, String(value));
    });
    params.set("waste", String((waste * 100).toFixed(2)));
    const url = new URL(window.location.href);
    url.search = params.toString();
    return url.toString();
  };

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    const shareUrl = buildShareUrl();
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const shareUrl = buildShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: calculator.title,
          text: calculator.description,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  const helperTextFor = (
    field: (typeof visibleInputs)[number],
    unit: string,
  ) => field.description ?? dictionary.calc.helperDefault.replace("{unit}", unit || dictionary.home.userUnits);

  const applyPreset = (presetId: PresetId) => {
    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setSelectedPreset(presetId);
    startTransition(() => {
      setWaste(() => clamp(baseWaste + preset.wasteAdjustment, 0, 0.35));
      if (preset.multiplier === 1) {
        setValues(initialValues);
        return;
      }
      setValues((prev) => {
        const next = { ...prev };
        calculator.inputs.forEach((field) => {
          if (field.kind !== "number") return;
          const baseline =
            typeof prev[field.id] === "number" ||
            (typeof prev[field.id] === "string" && prev[field.id] !== "")
              ? Number(prev[field.id])
              : Number(initialValues[field.id] ?? 0);
          next[field.id] = Number((baseline * preset.multiplier).toFixed(2));
        });
        return next;
      });
    });
  };

  const mainRow = resultRows[0];
  const detailRows = resultRows.slice(1);
  const packEstimateRow = resultRows.find((row) => row.packInfo);
  const packEstimate = packEstimateRow?.packInfo;
  const displayValue = (row: (typeof resultRows)[number]) =>
    unitTab === "user" ? row.userValue : row.siValue;
  const displayUnit = (row: (typeof resultRows)[number]) =>
    unitTab === "user" ? row.userUnit : row.siUnit;
  const withWasteValue = mainRow ? displayValue(mainRow) : 0;
  const baseValue = mainRow ? withWasteValue / (1 + waste) : 0;
  const completedFields = visibleInputs.reduce((count, field) => {
    const currentValue = values[field.id];
    if (field.kind === "number") {
      return currentValue !== "" && !Number.isNaN(Number(currentValue)) ? count + 1 : count;
    }
    if (field.kind === "select") {
      return currentValue ? count + 1 : count;
    }
    return count + 1;
  }, 0);
  const completionRatio =
    visibleInputs.length > 0 ? completedFields / visibleInputs.length : 0;
  const presetDescription =
    PRESETS.find((preset) => preset.id === selectedPreset)?.description[locale] ?? "";

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="surface-panel relative overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{calculator.category}</p>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
                    {calculator.title}
                  </h1>
                  <p className="text-sm text-muted-foreground lg:text-base mt-2">{calculator.description}</p>
                </div>
                <Button variant="outline" size="sm" asChild className="shrink-0">
                  <Link href={`/${locale}/calc/${calculator.slug}/guide`}>
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    {dictionary.home.guideLink}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.35em]">
              <Badge variant="brand" className="text-[10px]">
                <Sparkles className="mr-1 h-3 w-3" aria-hidden />
                {dictionary.calc.liveUpdate}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />
                {country.nameLocalized} · {country.unitSystem}
              </Badge>
              <Badge variant="glow" className="text-[10px]">
                {locale === "ru" ? "Пресет" : "Preset"} · {PRESETS.find((preset) => preset.id === selectedPreset)?.label[locale]}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {locale === "ru" ? "Режимы расчёта" : "Presets"}
              </Label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <Chip
                    key={preset.id}
                    selected={selectedPreset === preset.id}
                    variant={selectedPreset === preset.id ? "soft" : "outline"}
                    elevated={selectedPreset === preset.id}
                    onClick={() => applyPreset(preset.id)}
                  >
                    {preset.label[locale]}
                  </Chip>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{presetDescription}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        <section className={cn("surface-panel relative space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8", isUpdating && "ring-1 ring-primary/20")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{dictionary.calc.inputsTitle}</p>
              <p className="text-xs text-muted-foreground">{country.unitSystem.toUpperCase()}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>{locale === "ru" ? "Прогресс заполнения" : "Completion"}</span>
              <span>{Math.round(completionRatio * 100)}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/40">
              <span
                className="block h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${Math.round(completionRatio * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {completedFields}/{visibleInputs.length || 1} {locale === "ru" ? "полей заполнено" : "fields complete"}
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {visibleInputs.map((field) => {
              const unitLabel = unitLabelFor(country.unitSystem, field.unitKind);
              const helperCopy = helperTextFor(field, unitLabel);
              const Icon = unitKindIcons[field.unitKind ?? "default"] ?? unitKindIcons.default;
              const currentValue = values[field.id];
              const numericValue = Number(currentValue);
              const hasError =
                field.kind === "number" &&
                (currentValue === "" || currentValue === undefined || Number.isNaN(numericValue) || numericValue < 0);
              const errorId = `${field.id}-error`;
              return (
                <div
                  key={field.id}
                  className="rounded-2xl border border-border/60 bg-background/80 p-3 sm:p-4 shadow-sm shadow-black/5"
                >
                  <div className="flex items-start gap-3">
                    <span className="rounded-2xl bg-muted/40 p-2 text-primary flex-shrink-0">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={field.id} className="text-xs sm:text-sm font-semibold">
                          {field.label}
                        </Label>
                        <Tooltip content={helperCopy}>
                          <button
                            type="button"
                            className="text-muted-foreground transition hover:text-foreground"
                            aria-label={locale === "ru" ? "Пояснение" : "Helper"}
                          >
                            <Info className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </Tooltip>
                      </div>
                      {field.kind === "number" ? (
                        <div className="flex items-center gap-2 rounded-2xl border-2 border-border/70 bg-card px-3 py-2 focus-within:border-primary/70">
                          <Input
                            id={field.id}
                            type="number"
                            inputMode="decimal"
                            value={currentValue === undefined ? "" : String(currentValue)}
                            onChange={(event) => updateField(field.id, event.target.value)}
                            className="h-10 flex-1 border-0 bg-transparent text-base focus-visible:ring-0"
                            aria-invalid={hasError}
                            aria-describedby={hasError ? errorId : undefined}
                          />
                          <Badge variant="outline" className="text-[11px] uppercase tracking-widest">
                            {unitLabel}
                          </Badge>
                        </div>
                      ) : null}
                      {field.kind === "select" ? (
                        <Select value={(values[field.id] as string) ?? ""} onValueChange={(val) => updateField(field.id, val)}>
                          <SelectTrigger className="h-10 rounded-2xl text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                      {field.kind === "toggle" ? (
                        <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card px-4 py-2">
                          <span className="text-xs sm:text-sm text-muted-foreground pr-2">{helperCopy}</span>
                          <Switch checked={Boolean(values[field.id])} onCheckedChange={(checked) => updateField(field.id, checked)} />
                        </div>
                      ) : hasError ? (
                        <p id={errorId} className="text-xs text-destructive">
                          {locale === "ru" ? "Введите корректное значение" : "Enter a valid value"}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground leading-relaxed">{helperCopy}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-2xl border border-border/70 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-semibold">{dictionary.calc.waste}</Label>
              <Badge variant="outline" className="text-xs">{(waste * 100).toFixed(1)}%</Badge>
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <Input
                type="number"
                min={0}
                max={30}
                step={0.1}
                value={(waste * 100).toFixed(1)}
                onChange={(event) =>
                  startTransition(() =>
                    setWaste(Math.max(0, Math.min(0.3, Number(event.target.value) / 100))),
                  )
                }
                className="h-9 sm:h-10 text-base sm:text-sm"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">{dictionary.calc.wasteHelp}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[0.05, 0.08, 0.12].map((presetWaste) => (
                <Chip
                  key={presetWaste}
                  size="sm"
                  variant={Math.round(waste * 100) === Math.round(presetWaste * 100) ? "soft" : "ghost"}
                  selected={Math.round(waste * 100) === Math.round(presetWaste * 100)}
                  onClick={() => startTransition(() => setWaste(presetWaste))}
                >
                  {Math.round(presetWaste * 100)}%
                </Chip>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-panel relative space-y-4 sm:space-y-5 p-4 sm:p-6 lg:p-8 lg:sticky lg:top-24">
          {isUpdating && (
            <div className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl bg-background/40 backdrop-blur-sm" aria-hidden />
          )}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {dictionary.calc.resultsPanel ?? dictionary.calc.resultsTitle}
              </p>
              <p className="text-xs text-muted-foreground">{dictionary.calc.liveUpdate}</p>
            </div>
            <Tabs value={unitTab} onValueChange={(val) => setUnitTab(val as "user" | "si")}>
              <TabsList className="h-8 sm:h-10">
                <TabsTrigger value="user" className="text-xs sm:text-sm px-2 sm:px-3">{dictionary.home.userUnits}</TabsTrigger>
                <TabsTrigger value="si" className="text-xs sm:text-sm px-2 sm:px-3">{dictionary.home.siUnits}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {mainRow ? (
            <div className="rounded-2xl sm:rounded-3xl border border-primary/40 bg-primary/10 p-3 sm:p-4 lg:p-5 text-primary" aria-live="polite">
              <p className="text-xs uppercase tracking-widest">{dictionary.calc.mainResult}</p>
              <p className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-semibold">
                <AnimatedNumber value={withWasteValue} />
                <span className="ml-1.5 sm:ml-2 text-sm sm:text-base text-primary/80">{displayUnit(mainRow)}</span>
              </p>
            </div>
          ) : null}
          {mainRow ? (
            <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card/70 p-3 sm:p-4">
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-foreground">
                <span>{dictionary.calc.withWaste}</span>
                <span className="text-muted-foreground">+{(waste * 100).toFixed(1)}%</span>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-semibold">
                <AnimatedNumber value={withWasteValue} />{" "}
                <span className="text-sm sm:text-base text-muted-foreground">{displayUnit(mainRow)}</span>
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ≈ {formatNumber(baseValue)} {displayUnit(mainRow)} {dictionary.calc.mainResult.toLowerCase()}
              </p>
            </div>
          ) : null}
          {packEstimate ? (
            <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card/70 p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-medium">{dictionary.calc.packaging}</p>
              <p className="mt-2 text-xl sm:text-2xl font-semibold text-primary">
                <AnimatedNumber value={packEstimate.count} />{" "}
                <span className="text-sm sm:text-base text-muted-foreground">{packEstimate.unit}</span>
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {packEstimateRow
                  ? dictionary.calc.packsNeeded
                      .replace("{amount}", formatNumber(displayValue(packEstimateRow)))
                      .replace("{unit}", displayUnit(packEstimateRow))
                      .replace("{packs}", String(packEstimate.count))
                      .replace("{packUnit}", packEstimate.unit)
                  : null}
              </p>
            </div>
          ) : null}
          <div className="space-y-2 sm:space-y-3">
            {detailRows.map((row) => (
              <div key={row.id} className="rounded-xl sm:rounded-2xl border border-border/70 bg-background/50 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium truncate">{row.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {unitTab === "user" ? dictionary.home.userUnits : dictionary.home.siUnits}
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-primary whitespace-nowrap">
                    <AnimatedNumber value={displayValue(row)} />{" "}
                    <span className="text-xs sm:text-sm text-muted-foreground">{displayUnit(row)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <CopyIcon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {copied ? dictionary.home.copied : dictionary.home.copyLink}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {locale === "ru" ? "Поделиться" : "Share"}
            </Button>
            <Button variant="subtle" size="sm" onClick={handleDownload}>
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {locale === "ru" ? "PDF" : "PDF"}
            </Button>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-amber-200 bg-amber-50/60 p-3 sm:p-4 text-xs sm:text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="flex items-start gap-2 font-medium">
              <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" aria-hidden />
              <p className="leading-relaxed">{dictionary.calc.disclaimer}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3" id="faq">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>{dictionary.calc.howTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="how">
              <AccordionItem value="how">
                <AccordionTrigger>{calculator.title}</AccordionTrigger>
                <AccordionContent>{calculator.howItWorks}</AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button variant="link" className="px-0" asChild>
              <Link href={`/${locale}/calc/${calculator.slug}/guide`}>{dictionary.home.guideLink}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>{dictionary.calc.faqTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {calculator.faq.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>{dictionary.home.countryDefaults}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              {country.nameLocalized} · {country.currency} · {country.unitSystem}
            </p>
            <p>
              {dictionary.calc.waste}: {(baseWaste * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader>
            <CardTitle>{dictionary.calc.contextTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4 text-primary" aria-hidden />
            <p>{dictionary.calc.disclaimer}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previous = useRef(value);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const start = previous.current;
    const delta = value - start;
    const duration = 350;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const next = start + delta * progress;
      setDisplayValue(next);
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    frame.current = requestAnimationFrame(tick);
    previous.current = value;

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value]);

  return <>{formatNumber(displayValue)}</>;
};


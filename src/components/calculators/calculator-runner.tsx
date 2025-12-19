"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Box,
  CopyIcon,
  Gauge,
  Info,
  Layers,
  Percent,
  Ruler,
  Settings2,
  ShieldCheck,
  Sparkles,
  Square,
} from "lucide-react";

import { useCountry } from "@/components/providers/country-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const handleCopyLink = async () => {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === "") return;
      params.set(key, String(value));
    });
    params.set("waste", String((waste * 100).toFixed(2)));
    const url = new URL(window.location.href);
    url.search = params.toString();
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const helperTextFor = (
    field: (typeof visibleInputs)[number],
    unit: string,
  ) => field.description ?? dictionary.calc.helperDefault.replace("{unit}", unit || dictionary.home.userUnits);

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

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="surface-panel relative overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-3 sm:space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{calculator.category}</p>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight lg:text-4xl">{calculator.title}</h1>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground lg:text-base">{calculator.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/60 bg-muted/30 px-2.5 sm:px-3 py-1 text-muted-foreground">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary flex-shrink-0" aria-hidden />
                {dictionary.calc.liveUpdate}
              </span>
              <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/60 bg-muted/30 px-2.5 sm:px-3 py-1 text-muted-foreground">
                <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary flex-shrink-0" aria-hidden />
                <span className="truncate">{country.nameLocalized} · {country.unitSystem}</span>
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/70 p-3 sm:p-4">
            <div className="flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap">
                <CopyIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{copied ? dictionary.home.copied : dictionary.home.copyLink}</span>
                <span className="sm:hidden">{copied ? dictionary.home.copied : locale === "ru" ? "Скопировать" : "Copy"}</span>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{dictionary.calc.disclaimer}</p>
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
          <div className="space-y-3 sm:space-y-4">
            {visibleInputs.map((field) => {
              const unitLabel = unitLabelFor(country.unitSystem, field.unitKind);
              const helperCopy = helperTextFor(field, unitLabel);
              const Icon = unitKindIcons[field.unitKind ?? "default"] ?? unitKindIcons.default;
              return (
                <div
                  key={field.id}
                  className="rounded-xl sm:rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4 shadow-sm shadow-black/5"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="rounded-lg sm:rounded-xl bg-muted/50 p-1.5 sm:p-2 text-primary flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
                    </span>
                    <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                      <Label htmlFor={field.id} className="text-xs sm:text-sm font-medium">
                        {field.label}
                      </Label>
                      {field.kind === "number" ? (
                        <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-border/80 bg-card px-2 sm:px-3 py-1 sm:py-1.5">
                          <Input
                            id={field.id}
                            type="number"
                            inputMode="decimal"
                            value={values[field.id] === undefined ? "" : String(values[field.id])}
                            onChange={(event) => updateField(field.id, event.target.value)}
                            className="h-9 sm:h-10 flex-1 border-0 bg-transparent text-sm sm:text-base focus-visible:ring-0 min-w-0"
                          />
                          <span className="text-xs font-medium uppercase text-muted-foreground whitespace-nowrap flex-shrink-0">{unitLabel}</span>
                        </div>
                      ) : null}
                      {field.kind === "select" ? (
                        <Select value={(values[field.id] as string) ?? ""} onValueChange={(val) => updateField(field.id, val)}>
                          <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
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
                        <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-border/80 bg-card px-3 sm:px-4 py-1.5 sm:py-2">
                          <span className="text-xs sm:text-sm text-muted-foreground pr-2">{helperCopy}</span>
                          <Switch checked={Boolean(values[field.id])} onCheckedChange={(checked) => updateField(field.id, checked)} />
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground leading-relaxed">{helperCopy}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-primary/5 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-semibold">{dictionary.calc.waste}</Label>
              <Badge variant="outline" className="text-xs">{(waste * 100).toFixed(1)}%</Badge>
            </div>
            <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Input
                type="number"
                min={0}
                max={30}
                value={(waste * 100).toFixed(1)}
                onChange={(event) =>
                  startTransition(() =>
                    setWaste(Math.max(0, Math.min(0.3, Number(event.target.value) / 100))),
                  )
                }
                className="h-9 sm:h-10 text-sm sm:text-base"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">{dictionary.calc.wasteHelp}</p>
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
            <div className="rounded-2xl sm:rounded-3xl border border-primary/40 bg-primary/10 p-3 sm:p-4 lg:p-5 text-primary">
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
            {calculator.guide ? (
              <Button variant="link" className="px-0" asChild>
                <Link href={`/${locale}/calc/${calculator.slug}/guide`}>{dictionary.home.guideLink}</Link>
              </Button>
            ) : null}
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


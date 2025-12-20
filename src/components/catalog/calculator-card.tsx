import Link from "next/link";

import { ArrowRight, BookOpen, Heart, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/config/site";
import type { CalculatorRecord } from "@/lib/server/calculators";
import type { Dictionary } from "@/lib/i18n";

type CalculatorMeta = {
  icon: LucideIcon;
  gradient: string;
  accent: string;
};

type Props = {
  calculator: CalculatorRecord;
  locale: Locale;
  dictionary: Dictionary;
  meta?: CalculatorMeta;
  isPopular?: boolean;
  isFavorite?: boolean;
  onFavorite?: (slug: string) => void;
  badges?: Array<{ id: string; label: string; variant?: React.ComponentProps<typeof Badge>["variant"] }>;
};

export const CalculatorCard = ({
  calculator,
  locale,
  dictionary,
  meta,
  isPopular,
  isFavorite,
  onFavorite,
  badges = [],
}: Props) => {
  const Icon = meta?.icon ?? ArrowRight;
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border border-border/50 bg-card/90 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-xl focus-within:ring-2 focus-within:ring-primary/40">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          meta?.gradient
            ? `bg-gradient-to-br ${meta.gradient}`
            : "bg-gradient-to-br from-primary/10 via-transparent",
          "group-hover:opacity-100",
        )}
      />
      <CardHeader className="relative flex flex-1 flex-col gap-4 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-3xl border border-border/40 bg-background/80 p-3 text-primary shadow-sm shadow-black/5">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <Badge variant="outline" className="capitalize text-xs tracking-normal">
                {calculator.category}
              </Badge>
              {isPopular ? (
                <Badge variant="brand" className="text-[10px]">
                  {dictionary.home.mostPopular}
                </Badge>
              ) : null}
              {badges.map((badge) => (
                <Badge key={badge.id} variant={badge.variant ?? "glow"} className="text-[10px]">
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>
          {/* {onFavorite ? (
            <Tooltip
              content={
                isFavorite
                  ? locale === "ru"
                    ? "Убрать из избранного"
                    : "Remove favorite"
                  : locale === "ru"
                    ? "Добавить в избранное"
                    : "Save to favorites"
              }
            >
              <button
                type="button"
                aria-label={locale === "ru" ? "Переключить избранное" : "Toggle favorite"}
                aria-pressed={isFavorite}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onFavorite(calculator.slug);
                }}
                className={cn(
                  "rounded-2xl border px-3 py-2 transition-all duration-200",
                  isFavorite
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/70 text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                <Heart className={cn("h-4 w-4", isFavorite ? "fill-current" : undefined)} aria-hidden />
              </button>
            </Tooltip>
          ) : null} */}
        </div>
        <div className="space-y-3">
          <CardTitle className="text-xl font-semibold leading-tight text-foreground sm:text-2xl">
            {calculator.title}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {calculator.description}
          </CardDescription>
          <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" aria-hidden />
            {dictionary.home.cardHighlights ?? (locale === "ru" ? "momentальный расчет" : "instant result")}
          </p>
        </div>
      </CardHeader>
      <CardContent className="relative flex-1 pb-0">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {calculator.howItWorks}
        </p>
      </CardContent>
      <CardFooter className="relative mt-auto flex flex-col gap-3 pt-0">
        {/* {isFavorite ? (
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-primary">
              <Heart className="h-3 w-3 fill-current" aria-hidden />
              {locale === "ru" ? "В избранном" : "Saved"}
            </span>
          </div>
        ) : null} */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button className="flex-1 " asChild>
            <Link href={`/${locale}/calc/${calculator.slug}`} className="justify-center">
              <span>{dictionary.home.cardCta}</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial">
            <Link href={`/${locale}/calc/${calculator.slug}/guide`}>
              <BookOpen className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {dictionary.home.guideLink}
            </Link>
          </Button>
          {onFavorite ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={locale === "ru" ? "В избранное" : "Favorite"}
              aria-pressed={isFavorite}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onFavorite(calculator.slug);
              }}
              className={cn(
                "rounded-2xl border-dashed",
                isFavorite ? "border-primary text-primary" : "text-muted-foreground",
              )}
            >
              <Heart className={cn("h-4 w-4", isFavorite ? "fill-current" : undefined)} aria-hidden />
            </Button>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
};

export const CalculatorCardSkeleton = () => (
  <div className="rounded-[24px] border border-border/40 bg-card/70 p-6 shadow-[0_15px_40px_rgba(17,19,27,0.06)]">
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-3xl skeleton" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded-full skeleton" />
          <div className="h-3 w-16 rounded-full skeleton" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded-full skeleton" />
        <div className="h-3 w-full rounded-full skeleton" />
        <div className="h-3 w-2/3 rounded-full skeleton" />
      </div>
      <div className="h-10 w-full rounded-2xl skeleton" />
    </div>
  </div>
);



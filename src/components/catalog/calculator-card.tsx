import Link from "next/link";

import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
};

export const CalculatorCard = ({ calculator, locale, dictionary, meta, isPopular }: Props) => {
  const Icon = meta?.icon ?? ArrowRight;
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border border-border/60 bg-card/95 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div className={`absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br ${meta?.gradient ?? "from-primary/10 via-transparent"} `} />
      <CardHeader className="relative flex flex-1 flex-col gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-border/50 bg-background/80 p-3 text-primary shadow-sm">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div className="space-y-1">
            <Badge variant="outline" className="capitalize text-xs">
              {calculator.category}
            </Badge>
            {isPopular ? (
              <Badge className="bg-primary/10 text-primary" variant="secondary">
                {dictionary.home.mostPopular}
              </Badge>
            ) : null}
          </div>
        </div>
        <div>
          <CardTitle className="text-lg font-semibold leading-tight sm:text-xl">
            {calculator.title}
          </CardTitle>
          <CardDescription className="mt-2 text-sm">
            {calculator.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative pb-2">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {calculator.howItWorks}
        </p>
      </CardContent>
      <CardFooter className="relative mt-auto pt-2">
        <Link
          href={`/${locale}/calc/${calculator.slug}`}
          className="flex w-full items-center justify-between text-sm font-semibold text-primary transition group-hover:translate-x-0.5"
        >
          <span>{dictionary.home.cardCta}</span>
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
};

export const CalculatorCardSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm shadow-black/5">
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-muted/60" />
        <div className="h-3 w-24 rounded-full bg-muted/60" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded-full bg-muted/60" />
        <div className="h-3 w-full rounded-full bg-muted/50" />
        <div className="h-3 w-2/3 rounded-full bg-muted/40" />
      </div>
      <div className="h-3 w-1/2 rounded-full bg-muted/50" />
    </div>
  </div>
);



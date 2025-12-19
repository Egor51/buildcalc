import Link from "next/link";

import { CalculatorsMenu } from "@/components/layout/calculators-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { CountrySelect } from "@/components/country-select";
import type { Locale } from "@/lib/config/site";
import { locales, siteConfig } from "@/lib/config/site";
import { getCalculators } from "@/lib/server/calculators";

type Props = {
  locale: Locale;
  children: React.ReactNode;
};

export const SiteShell = async ({ locale, children }: Props) => {
  const calculators = await getCalculators(locale);
  const alternate = locales.find((code) => code !== locale) ?? locale;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/20">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <MobileMenu locale={locale} />
            <Link
              href={`/${locale}`}
              className="text-lg font-bold tracking-tight transition-colors hover:text-primary sm:text-xl"
            >
              {siteConfig.name}
            </Link>
            {/* <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground sm:flex">
              <Link href={`/${locale}#catalog`} className="transition hover:text-foreground">
                {locale === "ru" ? "Каталог" : "Catalog"}
              </Link>
              <Link href={`/${locale}#popular`} className="transition hover:text-foreground">
                {locale === "ru" ? "Популярные" : "Popular"}
              </Link>
            </nav> */}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <CalculatorsMenu
              calculators={calculators}
              locale={locale}
              dictionary={{
                allCalculators: locale === "ru" ? "Все калькуляторы" : "All Calculators",
              }}
            />
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href={`/${alternate}`}
                className="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {alternate.toUpperCase()}
              </Link>
              <CountrySelect />
            </div>
            {/* <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href={`/${locale}#catalog`}>{locale === "ru" ? "Открыть каталог" : "Browse Catalog"}</Link>
            </Button> */}
          </div>
        </div>
      </header>
      <main className="container max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer className="border-t bg-card/50">
        <div className="container flex flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>&copy; {new Date().getFullYear()} {siteConfig.name}</span>
          <span className="text-xs sm:text-sm">{siteConfig.description}</span>
        </div>
      </footer>
    </div>
  );
};



"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Globe, X } from "lucide-react";
import type { Locale } from "@/lib/config/site";
import { locales, siteConfig } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/components/providers/country-provider";

type Props = {
  locale: Locale;
};

export function MobileMenu({ locale }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const alternate = locales.find((code) => code !== locale) ?? locale;
  const { country, countries, setCountryCode } = useCountry();
  const isBrowser = typeof window !== "undefined";
  
  // Remove current locale from pathname to get the path without locale
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  useEffect(() => {
    if (!isBrowser) return;
    if (!open) {
      document.body.style.removeProperty("overflow");
      return;
    }
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.removeProperty("overflow");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isBrowser]);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="sm:hidden h-10 w-10 rounded-xl border-border/70"
        onClick={() => setOpen(true)}
        aria-label={locale === "ru" ? "Открыть меню" : "Open menu"}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isBrowser && open ? createPortal(
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity items-center"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="fixed inset-y-0 left-0 z-[70] w-full max-w-[300px] sm:max-w-[360px] bg-card shadow-2xl border-r border-border flex flex-col"
            style={{ 
              transform: 'translateX(0)',
              willChange: 'transform'
            }}
            role="dialog"
            aria-modal="true"
            aria-label={locale === "ru" ? "Меню навигации" : "Navigation menu"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-border/60 flex-shrink-0">
              <Link
                href={`/${locale}`}
                onClick={() => setOpen(false)}
                className="inline-flex h-10  text-lg font-bold tracking-tight transition-colors hover:text-primary"
              >
                {siteConfig.name}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-9 w-9"
                aria-label={locale === "ru" ? "Закрыть меню" : "Close menu"}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {locale === "ru" ? "Навигация" : "Navigation"}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href={`/${locale}#catalog`}
                onClick={() => setOpen(false)}
                className="text-base font-medium transition-colors hover:text-primary"
              >
                {locale === "ru" ? "Каталог" : "Catalog"}
              </Link>
              <Link
                href={`/${locale}#popular`}
                onClick={() => setOpen(false)}
                className="text-base font-medium transition-colors hover:text-primary"
              >
                {locale === "ru" ? "Популярные" : "Popular"}
              </Link>
            </nav>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {locale === "ru" ? "Язык" : "Language"}
            </h3>
            <Link
              href={`/${alternate}${pathWithoutLocale}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-base font-medium transition-colors hover:bg-accent"
            >
              <Globe className="h-4 w-4" />
              {alternate === "ru" ? "Русский" : "English"}
            </Link>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {locale === "ru" ? "Единицы измерения" : "Unit System"}
            </h3>
            <div className="space-y-2 rounded-2xl border border-border bg-card/80 p-3 shadow-inner">
              <label htmlFor="mobile-unit-select" className="text-xs font-medium text-muted-foreground">
                {locale === "ru" ? "Страна / система измерения" : "Country · unit system"}
              </label>
              <select
                id="mobile-unit-select"
                value={country.countryCode}
                onChange={(event) => setCountryCode(event.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {countries.map((item) => (
                  <option key={item.countryCode} value={item.countryCode}>
                    {item.nameLocalized} · {item.unitSystem === "imperial" ? "Imperial" : "Metric"}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                {locale === "ru"
                  ? "Система измерения меняется вместе со страной."
                  : "Unit system follows your selected country."}
              </p>
            </div>
          </div>
            </div>
          </div>
        </>,
        document.body
      ) : null}
    </>
  );
}

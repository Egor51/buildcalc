"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Globe, X } from "lucide-react";
import type { Locale } from "@/lib/config/site";
import { locales } from "@/lib/config/site";
import { CountrySelect } from "@/components/country-select";
import { Button } from "@/components/ui/button";

type Props = {
  locale: Locale;
};

export function MobileMenu({ locale }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const alternate = locales.find((code) => code !== locale) ?? locale;
  
  // Remove current locale from pathname to get the path without locale
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  useEffect(() => {
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
  }, [open]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-[300px] sm:max-w-[360px] bg-card shadow-2xl border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/60 flex-shrink-0">
              <p className="text-base font-semibold">
                {locale === "ru" ? "Меню" : "Menu"}
              </p>
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
            <CountrySelect showIcon={true} triggerClassName="w-full h-11" />
          </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

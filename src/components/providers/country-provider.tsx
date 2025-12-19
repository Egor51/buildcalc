"use client";

import * as React from "react";

import { COUNTRY_STORAGE_KEY } from "@/lib/constants/storage";
import type { CountryProfileDTO } from "@/types/country";

type CountryContextValue = {
  country: CountryProfileDTO;
  countries: CountryProfileDTO[];
  setCountryCode: (code: string) => void;
};

const CountryContext = React.createContext<CountryContextValue | undefined>(
  undefined,
);

type Props = {
  countries: CountryProfileDTO[];
  initialCountry: CountryProfileDTO;
  children: React.ReactNode;
};

export const CountryProvider = ({
  countries,
  initialCountry,
  children,
}: Props) => {
  const [country, setCountry] = React.useState(initialCountry);

  React.useEffect(() => {
    const storedCode =
      window.localStorage.getItem(COUNTRY_STORAGE_KEY) ??
      initialCountry.countryCode;
    const next = countries.find(
      (item) => item.countryCode === storedCode,
    );
    if (next) {
      setCountry(next);
    }
  }, [countries, initialCountry.countryCode]);

  const persistCountry = React.useCallback(async (code: string) => {
    window.localStorage.setItem(COUNTRY_STORAGE_KEY, code);
    await fetch("/api/country", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryCode: code }),
    });
  }, []);

  const setCountryCode = React.useCallback(
    (code: string) => {
      const next = countries.find((item) => item.countryCode === code);
      if (!next) return;
      setCountry(next);
      persistCountry(code).catch(() => {});
    },
    [countries, persistCountry],
  );

  const value = React.useMemo(
    () => ({ country, countries, setCountryCode }),
    [country, countries, setCountryCode],
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
};

export const useCountry = () => {
  const context = React.useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used within CountryProvider");
  }
  return context;
};



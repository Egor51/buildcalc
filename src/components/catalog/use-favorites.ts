"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "buildcalc:favorites";

const readFavorites = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse favorites", error);
    return [];
  }
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const frame = requestAnimationFrame(() => {
      setFavorites(readFavorites());
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const persist = useCallback((next: string[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggleFavorite = useCallback(
    (slug: string) => {
      setFavorites((prev) => {
        const exists = prev.includes(slug);
        const next = exists ? prev.filter((item) => item !== slug) : [...prev, slug];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  );

  return {
    favorites,
    hydrated,
    toggleFavorite,
    isFavorite,
  };
};

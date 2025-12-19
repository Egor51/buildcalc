import type { Locale } from "@/lib/config/site";

import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const dictionaries = {
  en,
  ru,
};

export type Dictionary = typeof en;

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];



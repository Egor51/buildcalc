"use client";

import { useRouter } from "next/navigation";
import { Calculator } from "lucide-react";
import type { Locale } from "@/lib/config/site";
import type { CalculatorRecord } from "@/lib/server/calculators";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  calculators: CalculatorRecord[];
  locale: Locale;
  dictionary: {
    allCalculators: string;
  };
};

export function CalculatorsMenu({ calculators, locale, dictionary }: Props) {
  const router = useRouter();

  return (
    <Select
      value=""
      onValueChange={(value) => {
        if (value) {
          router.push(`/${locale}/calc/${value}`);
        }
      }}
    >
      <SelectTrigger className="w-9 h-9 sm:w-[200px] sm:h-10 px-2 sm:px-3 justify-center sm:justify-between">
        <Calculator className="h-4 w-4 flex-shrink-0" />
        <span className="hidden sm:inline-block min-w-0 flex-1">
          <SelectValue placeholder={dictionary.allCalculators} />
        </span>
      </SelectTrigger>
      <SelectContent className="max-h-[400px]">
        {calculators.map((calc) => (
          <SelectItem key={calc.id} value={calc.slug}>
            {calc.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

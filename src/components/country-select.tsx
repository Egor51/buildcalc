"use client";

import { Globe } from "lucide-react";

import { useCountry } from "@/components/providers/country-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  showIcon?: boolean;
  triggerClassName?: string;
};

export const CountrySelect = ({
  showIcon = true,
  triggerClassName,
}: Props = {}) => {
  const { country, countries, setCountryCode } = useCountry();

  return (
    <div className="flex items-center gap-2">
      {showIcon ? (
        <Globe className="h-4 w-4 text-muted-foreground transition-colors sm:h-5 sm:w-5" />
      ) : null}
      <Select value={country.countryCode} onValueChange={setCountryCode}>
        <SelectTrigger
          className={triggerClassName ?? "h-10 w-[180px] text-sm sm:w-[200px]"}
        >
          <SelectValue placeholder="Country">{country.nameLocalized}</SelectValue>
        </SelectTrigger>
        <SelectContent align="end" className="max-h-[300px]">
          {countries.map((item) => (
            <SelectItem
              key={item.countryCode}
              value={item.countryCode}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{item.nameLocalized}</span>
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {item.unitSystem}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};



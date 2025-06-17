"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, getCountryByCode, getPopularCountries, type Country } from "@/lib/countries";

interface CountrySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showFlag?: boolean;
  showCurrency?: boolean;
  showPhonePrefix?: boolean;
}

export function CountrySelect({
  value,
  onValueChange,
  placeholder = "Select country...",
  disabled = false,
  className,
  showFlag = true,
  showCurrency = false,
  showPhonePrefix = false,
}: CountrySelectProps) {
  const selectedCountry = value ? getCountryByCode(value) : null;
  const popularCountries = getPopularCountries();

  const renderCountryOption = (country: Country) => (
    <div className="flex items-center gap-2">
      {showFlag && (
        <span className="text-lg" role="img" aria-label={`${country.name} flag`}>
          {country.flag}
        </span>
      )}
      <span>{country.name}</span>
      {showPhonePrefix && (
        <span className="text-xs text-muted-foreground ml-auto">
          {country.phonePrefix}
        </span>
      )}
      {showCurrency && (
        <span className="text-xs text-muted-foreground ml-auto">
          {country.currency}
        </span>
      )}
    </div>
  );

  const renderSelectedCountry = () => {
    if (!selectedCountry) return placeholder;

    return (
      <div className="flex items-center gap-2">
        {showFlag && (
          <span className="text-lg" role="img" aria-label={`${selectedCountry.name} flag`}>
            {selectedCountry.flag}
          </span>
        )}
        <span>{selectedCountry.name}</span>
        {showPhonePrefix && (
          <span className="text-xs text-muted-foreground">
            {selectedCountry.phonePrefix}
          </span>
        )}
        {showCurrency && (
          <span className="text-xs text-muted-foreground">
            {selectedCountry.currency}
          </span>
        )}
      </div>
    );
  };

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {renderSelectedCountry()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {/* Popular Countries */}
        {popularCountries.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Popular
            </div>
            {popularCountries.map((country) => (
              <SelectItem key={`popular-${country.code}`} value={country.code}>
                {renderCountryOption(country)}
              </SelectItem>
            ))}
            <div className="border-t my-1" />
          </>
        )}

        {/* All Countries */}
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          All Countries
        </div>
        {COUNTRIES.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {renderCountryOption(country)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CountrySelect;

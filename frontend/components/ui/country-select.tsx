"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedCountry = value ? getCountryByCode(value) : null;
  const popularCountries = getPopularCountries();

  // Filter countries based on search query
  const filteredCountries = React.useMemo(() => {
    if (!searchQuery) return COUNTRIES;
    
    const query = searchQuery.toLowerCase();
    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = (countryCode: string) => {
    onValueChange?.(countryCode);
    setOpen(false);
    setSearchQuery("");
  };

  const renderCountryOption = (country: Country, isSelected: boolean = false) => (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        {showFlag && (
          <span className="text-lg" role="img" aria-label={`${country.name} flag`}>
            {country.flag}
          </span>
        )}
        <div className="flex flex-col">
          <span className="font-medium">{country.name}</span>
          <span className="text-xs text-muted-foreground">{country.code}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {showPhonePrefix && <span>{country.phonePrefix}</span>}
        {showCurrency && <span>{country.currency}</span>}
        {isSelected && <Check className="h-4 w-4" />}
      </div>
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedCountry && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedCountry ? (
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
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search countries..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>No country found.</CommandEmpty>
            
            {/* Popular Countries */}
            {!searchQuery && popularCountries.length > 0 && (
              <CommandGroup heading="Popular">
                {popularCountries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.code}
                    onSelect={() => handleSelect(country.code)}
                    className="cursor-pointer"
                  >
                    {renderCountryOption(country, value === country.code)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {/* All Countries */}
            <CommandGroup heading={searchQuery ? "Results" : "All Countries"}>
              {filteredCountries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.code}
                  onSelect={() => handleSelect(country.code)}
                  className="cursor-pointer"
                >
                  {renderCountryOption(country, value === country.code)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CountrySelect;

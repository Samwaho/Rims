import React, { memo, useMemo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types/product";

interface FilterAccordionProps {
  isLoading: boolean;
  filters: {
    size: string[];
    category: string[];
    priceRange?: [number, number];
  };
  products: Product[];
  maxPrice: number;
  onFilterChange: (type: "size" | "category", value: string) => void;
  onPriceRangeChange: (value: [number, number]) => void;
}

const LoadingSkeleton = memo(({ count }: { count: number }) => (
  <>
    {Array(count)
      .fill(0)
      .map((_, index) => (
        <Skeleton key={index} className="h-6 w-full" />
      ))}
  </>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

const FilterItem = memo(
  ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <Label className="flex items-center gap-2 font-normal cursor-pointer capitalize">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      {label}
    </Label>
  )
);

FilterItem.displayName = "FilterItem";

const PriceRangeContent = memo(
  ({
    priceRange,
    maxPrice,
    onPriceRangeChange,
  }: {
    priceRange?: [number, number];
    maxPrice: number;
    onPriceRangeChange: (value: [number, number]) => void;
  }) => (
    <>
      <Slider
        min={0}
        max={maxPrice}
        step={100}
        value={priceRange || [0, maxPrice]}
        onValueChange={(value) => onPriceRangeChange(value as [number, number])}
        className="w-full mt-2"
      />
      <div className="flex justify-between text-sm text-muted-foreground mt-2">
        <span>{formatPrice(priceRange?.[0] ?? 0)}</span>
        <span>{formatPrice(priceRange?.[1] ?? maxPrice)}</span>
      </div>
    </>
  )
);

PriceRangeContent.displayName = "PriceRangeContent";

export const FilterAccordion: React.FC<FilterAccordionProps> = memo(
  ({
    isLoading,
    filters,
    products,
    maxPrice,
    onFilterChange,
    onPriceRangeChange,
  }) => {
    const uniqueSizes = useMemo(
      () => Array.from(new Set(products.map((product) => product.size))),
      [products]
    );

    const categories = ["general", "wheels", "tyres"];

    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="size">
          <AccordionTrigger className="text-base font-medium">
            Size
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-2">
              {isLoading ? (
                <LoadingSkeleton count={5} />
              ) : (
                uniqueSizes.map((size) => (
                  <FilterItem
                    key={size}
                    label={size}
                    checked={filters.size.includes(size)}
                    onChange={() => onFilterChange("size", size)}
                  />
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="category">
          <AccordionTrigger className="text-base font-medium">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-2">
              {isLoading ? (
                <LoadingSkeleton count={3} />
              ) : (
                categories.map((category) => (
                  <FilterItem
                    key={category}
                    label={category}
                    checked={filters.category.includes(category)}
                    onChange={() => onFilterChange("category", category)}
                  />
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <PriceRangeContent
                priceRange={filters.priceRange}
                maxPrice={maxPrice}
                onPriceRangeChange={onPriceRangeChange}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
);

FilterAccordion.displayName = "FilterAccordion";

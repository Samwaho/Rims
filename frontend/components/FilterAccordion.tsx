import React from "react";
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

interface Product {
  _id: string;
  brand: string;
  category: string;
  price: number;
}

interface FilterAccordionProps {
  isLoading: boolean;
  filters: {
    brand: string[];
    category: string[];
    priceRange?: [number, number];
  };
  products: Product[];
  maxPrice: number;
  onFilterChange: (type: "brand" | "category", value: string) => void;
  onPriceRangeChange: (value: number[]) => void;
}

export const FilterAccordion: React.FC<FilterAccordionProps> = ({
  isLoading,
  filters,
  products,
  maxPrice,
  onFilterChange,
  onPriceRangeChange,
}) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="brand">
        <AccordionTrigger className="text-base font-medium">
          Brand
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-2">
            {isLoading
              ? Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <Skeleton key={index} className="h-6 w-full" />
                  ))
              : Array.from(
                  new Set(products.map((product) => product.brand))
                ).map((brand) => (
                  <Label
                    key={brand}
                    className="flex items-center gap-2 font-normal cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.brand.includes(brand)}
                      onCheckedChange={() => onFilterChange("brand", brand)}
                    />
                    {brand}
                  </Label>
                ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="category">
        <AccordionTrigger className="text-base font-medium">
          Category
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-2">
            {isLoading
              ? Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <Skeleton key={index} className="h-6 w-full" />
                  ))
              : ["general", "wheels", "tyres"].map((category) => (
                  <Label
                    key={category}
                    className="flex items-center gap-2 font-normal cursor-pointer capitalize"
                  >
                    <Checkbox
                      checked={filters.category.includes(category)}
                      onCheckedChange={() =>
                        onFilterChange("category", category)
                      }
                    />
                    {category}
                  </Label>
                ))}
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
            <>
              <Slider
                min={0}
                max={maxPrice}
                step={100}
                value={filters.priceRange ? filters.priceRange : [0, maxPrice]}
                onValueChange={onPriceRangeChange}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>
                  {formatPrice(filters.priceRange ? filters.priceRange[0] : 0)}
                </span>
                <span>
                  {formatPrice(
                    filters.priceRange ? filters.priceRange[1] : maxPrice
                  )}
                </span>
              </div>
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

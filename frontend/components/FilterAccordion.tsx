import React, { memo, useMemo, useState, useEffect } from "react";
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
import { PRODUCT_TYPES } from "@/lib/utils";
import {
  ListFilter,
  CircleDot,
  Gauge,
  Ruler,
  DollarSign,
  X,
} from "lucide-react";

interface FilterAccordionProps {
  isLoading: boolean;
  filters: {
    size: string[];
    category: string[];
    priceRange?: [number, number];
    productType: string[];
  };
  products: Product[];
  maxPrice: number;
  onFilterChange: (
    type: "size" | "category" | "productType",
    value: string
  ) => void;
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
    <Label className="flex items-center gap-2 text-sm px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded transition-colors duration-150">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="h-4 w-4 transition-all duration-200"
      />
      <span
        className={`text-sm ${
          checked ? "text-gray-900 font-medium" : "text-gray-600"
        }`}
      >
        {label}
      </span>
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
    const [isOpen, setIsOpen] = useState(false);
    const uniqueSizes = useMemo(
      () => Array.from(new Set(products.map((product) => product.size))),
      [products]
    );

    const categories = ["general", "wheels", "tyres"];

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".filter-accordion")) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getActiveFiltersCount = (
      filters: FilterAccordionProps["filters"]
    ) => {
      let count = 0;
      if (filters.size.length > 0) count += filters.size.length;
      if (filters.category.length > 0) count += filters.category.length;
      if (filters.productType.length > 0) count += filters.productType.length;
      if (filters.priceRange) count += 1;
      return count;
    };

    return (
      <div className="relative inline-block filter-accordion">
        <button
          className={`
            px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20
            transition-colors duration-200
            ${isOpen ? "bg-gray-50 ring-2 ring-primary/20" : ""}
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            Filter Products
            {getActiveFiltersCount(filters) > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full">
                {getActiveFiltersCount(filters)}
              </span>
            )}
          </span>
        </button>

        {isOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
          />
        )}

        {isOpen && (
          <div className="absolute right-0 mt-2 z-50 w-[280px] transform transition-all duration-200 ease-out">
            <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
              <div className="p-3 border-b flex items-center justify-between bg-gray-50">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  Filter Products
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <Accordion type="multiple" className="w-full">
                  <div className="p-2 border-b flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {getActiveFiltersCount(filters) > 0
                        ? `${getActiveFiltersCount(filters)} active`
                        : "No active filters"}
                    </span>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    <AccordionItem
                      value="category"
                      className="px-2 py-1 border-b"
                    >
                      <AccordionTrigger className="text-sm py-2 hover:no-underline">
                        <span className="text-gray-700 flex items-center gap-2">
                          <CircleDot className="h-4 w-4" />
                          General Category
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <div className="grid gap-1">
                          {isLoading ? (
                            <LoadingSkeleton count={3} />
                          ) : (
                            categories.map((category) => (
                              <FilterItem
                                key={category}
                                label={category}
                                checked={filters.category.includes(category)}
                                onChange={() =>
                                  onFilterChange("category", category)
                                }
                              />
                            ))
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem
                      value="productType"
                      className="px-2 py-1 border-b"
                    >
                      <AccordionTrigger className="text-sm py-2 hover:no-underline">
                        <span className="text-gray-700 flex items-center gap-2">
                          <Gauge className="h-4 w-4" />
                          Wheels Category
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <div className="grid gap-3 pt-2">
                          {isLoading ? (
                            <LoadingSkeleton count={3} />
                          ) : (
                            PRODUCT_TYPES.map((type) => (
                              <FilterItem
                                key={type}
                                label={
                                  type === "oem"
                                    ? "OEM (Original Equipment Manufacturer)"
                                    : type.charAt(0).toUpperCase() +
                                      type.slice(1)
                                }
                                checked={filters.productType.includes(type)}
                                onChange={() =>
                                  onFilterChange("productType", type)
                                }
                              />
                            ))
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="size" className="px-2 py-1 border-b">
                      <AccordionTrigger className="text-sm py-2 hover:no-underline">
                        <span className="text-gray-700 flex items-center gap-2">
                          <Ruler className="h-4 w-4" />
                          Size
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <div className="grid gap-3 pt-2">
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

                    <AccordionItem value="price" className="px-2 py-1 border-b">
                      <AccordionTrigger className="text-sm py-2 hover:no-underline">
                        <span className="text-gray-700 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Price Range
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <div className="pt-4">
                          {isLoading ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <PriceRangeContent
                              priceRange={filters.priceRange}
                              maxPrice={maxPrice}
                              onPriceRangeChange={onPriceRangeChange}
                            />
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </div>
                </Accordion>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

FilterAccordion.displayName = "FilterAccordion";

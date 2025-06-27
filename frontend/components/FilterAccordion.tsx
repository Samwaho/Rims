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
import { formatPrice, PRODUCT_CATEGORIES, PRODUCT_TYPES } from "@/lib/utils";
import { Product } from "@/types/product";
import {
  ListFilter,
  CircleDot,
  Gauge,
  Ruler,
  DollarSign,
  X,
  ChevronDown,
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
  onPriceRangeChange: (value: [number, number] | undefined) => void;
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
    <Label className="flex items-center gap-3 text-sm px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-all duration-200 group">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="h-4 w-4 transition-all duration-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <span
        className={`text-sm transition-colors duration-200 ${
          checked 
            ? "text-gray-900 font-medium" 
            : "text-gray-600 group-hover:text-gray-800"
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
    onPriceRangeChange: (value: [number, number] | undefined) => void;
  }) => {
    const [localRange, setLocalRange] = useState<[number, number]>(
      priceRange || [0, maxPrice]
    );

    useEffect(() => {
      setLocalRange(priceRange || [0, maxPrice]);
    }, [priceRange, maxPrice]);

    const handleRangeChange = (value: number[]) => {
      const newRange: [number, number] = [value[0], value[1]];
      setLocalRange(newRange);
      onPriceRangeChange(newRange);
    };

    return (
      <div className="space-y-4">
        <div className="relative">
          <Slider
            min={0}
            max={maxPrice}
            step={100}
            value={localRange}
            onValueChange={handleRangeChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-primary rounded-full mb-1"></div>
              <span className="text-xs font-medium">{formatPrice(localRange[0])}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-primary rounded-full mb-1"></div>
              <span className="text-xs font-medium">{formatPrice(localRange[1])}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Range:</span>
          <span className="text-sm text-gray-600">
            {formatPrice(localRange[0])} - {formatPrice(localRange[1])}
          </span>
        </div>
      </div>
    );
  }
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
      () => Array.from(new Set(products.map((product) => product.size).filter((size): size is string => Boolean(size)))),
      [products]
    );

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
            px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl
            hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20
            transition-all duration-200 shadow-sm
            ${isOpen ? "bg-gray-50 border-gray-300 ring-2 ring-primary/20 shadow-md" : ""}
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            Filter Products
            {getActiveFiltersCount(filters) > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full animate-pulse">
                {getActiveFiltersCount(filters)}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
          />
        )}

        {isOpen && (
          <div className="absolute right-0 mt-3 z-50 w-[320px] transform transition-all duration-200 ease-out">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <ListFilter className="h-4 w-4 text-primary" />
                  Filter Products
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <Accordion type="multiple" className="w-full">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <span className="text-xs font-medium text-gray-600">
                      {getActiveFiltersCount(filters) > 0
                        ? `${getActiveFiltersCount(filters)} active filter${getActiveFiltersCount(filters) > 1 ? 's' : ''}`
                        : "No active filters"}
                    </span>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto">
                    <AccordionItem
                      value="category"
                      className="px-3 py-2 border-b border-gray-100"
                    >
                      <AccordionTrigger className="text-sm py-3 hover:no-underline group">
                        <span className="text-gray-700 flex items-center gap-3 group-hover:text-gray-900 transition-colors duration-200">
                          <CircleDot className="h-4 w-4 text-primary" />
                          <span className="font-medium">Category</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <div className="grid gap-1">
                          {isLoading ? (
                            <LoadingSkeleton count={PRODUCT_CATEGORIES.length} />
                          ) : (
                            PRODUCT_CATEGORIES.map((category) => (
                              <FilterItem
                                key={category}
                                label={category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
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
                      className="px-3 py-2 border-b border-gray-100"
                    >
                      <AccordionTrigger className="text-sm py-3 hover:no-underline group">
                        <span className="text-gray-700 flex items-center gap-3 group-hover:text-gray-900 transition-colors duration-200">
                          <Gauge className="h-4 w-4 text-primary" />
                          <span className="font-medium">Product Type</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <div className="grid gap-1">
                          {isLoading ? (
                            <LoadingSkeleton count={PRODUCT_TYPES.length} />
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

                    <AccordionItem value="size" className="px-3 py-2 border-b border-gray-100">
                      <AccordionTrigger className="text-sm py-3 hover:no-underline group">
                        <span className="text-gray-700 flex items-center gap-3 group-hover:text-gray-900 transition-colors duration-200">
                          <Ruler className="h-4 w-4 text-primary" />
                          <span className="font-medium">Size</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <div className="grid gap-1">
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

                    <AccordionItem value="price" className="px-3 py-2 border-b border-gray-100">
                      <AccordionTrigger className="text-sm py-3 hover:no-underline group">
                        <span className="text-gray-700 flex items-center gap-3 group-hover:text-gray-900 transition-colors duration-200">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="font-medium">Price Range</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <div className="pt-2">
                          {isLoading ? (
                            <Skeleton className="h-20 w-full" />
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

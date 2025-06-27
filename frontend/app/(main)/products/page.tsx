"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/hooks/useDebounce";
import { ProductCard } from "@/components/ProductCard";
import { FilterAccordion } from "@/components/FilterAccordion";
import { Loader2, AlertCircle, PackageSearch, X, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { useProducts, ProductsResponse } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { Product, FilterState, ProductCategory } from "@/types/product";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PRODUCT_TYPES, formatPrice, PRODUCT_CATEGORIES } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";

const PRODUCTS_PER_PAGE = 12;

export const dynamic = "force-dynamic";

const ProductsPage = () => {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
    triggerOnce: false,
  });

  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const [filters, setFilters] = useState<FilterState>({
    size: [],
    category: searchParams.get("category")
      ? [searchParams.get("category") as ProductCategory]
      : [],
    priceRange: undefined,
    productType: [],
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const addToCartMutation = useCart();

  const {
    data: productsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useProducts(debouncedSearchTerm, { mode: "infinite" }) as ReturnType<
    typeof useInfiniteQuery<ProductsResponse>
  >;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const products = useMemo(() => {
    if (!productsData?.pages) return [];
    return productsData.pages.flatMap(
      (page: ProductsResponse) => page.products
    );
  }, [productsData]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product: Product) => {
        const { size, category, price, name, productType } = product;
        const {
          size: sizeFilters,
          category: categoryFilters,
          priceRange,
          productType: typeFilters,
        } = filters;

        // Handle size filtering - only filter if size exists and filters are applied
        const sizeMatch =
          sizeFilters.length === 0 ||
          (size && sizeFilters.includes(size));

        // Category filtering - check if category matches any selected filters
        const categoryMatch =
          categoryFilters.length === 0 ||
          categoryFilters.includes(category);

        const typeMatch =
          typeFilters.length === 0 || typeFilters.includes(productType);

        // Price range filtering - check if price is within the selected range
        const priceMatch = !priceRange || (price >= priceRange[0] && price <= priceRange[1]);

        return (
          sizeMatch &&
          categoryMatch &&
          typeMatch &&
          priceMatch &&
          name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
      })
      .sort(
        (a: Product, b: Product) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [products, filters, debouncedSearchTerm]);

  const maxPrice = useMemo(
    () => Math.max(...products.map((product: Product) => product.price)),
    [products]
  );

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  const handleClearFilters = () => {
    setFilters({
      size: [],
      category: [],
      priceRange: undefined,
      productType: [],
    });
    setSearchTerm("");
  };

  const onFilterChange = (
    type: "size" | "category" | "productType",
    value: string
  ) => {
    setFilters((prev) => {
      if (type === "category") {
        const categoryValue = value as ProductCategory;
        return {
          ...prev,
          category: prev.category.includes(categoryValue)
            ? prev.category.filter((item) => item !== categoryValue)
            : [...prev.category, categoryValue],
        };
      }
      if (type === "productType") {
        const typeValue = value as (typeof PRODUCT_TYPES)[number];
        return {
          ...prev,
          productType: prev.productType.includes(typeValue)
            ? prev.productType.filter((item) => item !== typeValue)
            : [...prev.productType, typeValue],
        };
      }
      return {
        ...prev,
        size: prev.size.includes(value)
          ? prev.size.filter((item) => item !== value)
          : [...prev.size, value],
      };
    });
  };

  const onPriceRangeChange = (value: [number, number] | undefined) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: value,
    }));
  };

  const showTiresComingSoon = filters.category.includes("tyres");

  if (showTiresComingSoon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageSearch className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Tyres Coming Soon!
            </h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              We're working on bringing you a great selection of tyres. Please
              check back later!
            </p>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="hover:bg-primary hover:text-white transition-all duration-200 px-6 py-3 text-base"
            >
              View Other Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-5 w-5 mr-3" />
              <AlertDescription className="text-base">
                {error instanceof Error
                  ? error.message
                  : "An error occurred while loading products"}
              </AlertDescription>
            </Alert>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => refetch()}
                className="bg-primary hover:bg-primary/90 px-6 py-3"
              >
                Try Again
              </Button>
              <Button variant="outline" onClick={handleClearFilters} className="px-6 py-3">
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = filters.size.length > 0 ||
    filters.category.length > 0 ||
    filters.productType.length > 0 ||
    filters.priceRange;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6">
            <div className="flex-1 w-full sm:w-auto">
              <ProductsHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
            <div className="flex items-center w-full sm:w-auto justify-end">
              <FilterAccordion
                isLoading={isLoading}
                filters={{
                  size: filters.size,
                  category: filters.category,
                  priceRange: filters.priceRange as
                    | [number, number]
                    | undefined,
                  productType: filters.productType,
                }}
                products={products as Product[]}
                maxPrice={maxPrice}
                onFilterChange={onFilterChange}
                onPriceRangeChange={onPriceRangeChange}
              />
            </div>
          </div>
        </div>
      </div>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {hasActiveFilters && (
            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Filter className="h-4 w-4 text-primary" />
                  Active filters:
                </div>
                {filters.category.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors duration-200"
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                    <button
                      onClick={() => onFilterChange("category", cat)}
                      className="hover:text-primary/80 transition-colors duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.productType.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                  >
                    {type === "oem" ? "OEM" : type}
                    <button
                      onClick={() => onFilterChange("productType", type)}
                      className="hover:text-blue-800 transition-colors duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.size.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors duration-200"
                  >
                    {size}
                    <button
                      onClick={() => onFilterChange("size", size)}
                      className="hover:text-green-800 transition-colors duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.priceRange && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors duration-200">
                    {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
                    <button
                      onClick={() => onPriceRangeChange(undefined)}
                      className="hover:text-purple-800 transition-colors duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="ml-auto text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {isLoading
              ? Array(PRODUCTS_PER_PAGE)
                  .fill(0)
                  .map((_, index) => <ProductCard.Skeleton key={index} />)
              : filteredProducts.map((product: Product) => (
                  <ProductCard
                    key={product._id}
                    product={{
                      _id: product._id,
                      name: product.name,
                      size: product.size,
                      madeIn: product.madeIn,
                      category: product.category,
                      price: product.price,
                      images: product.images,
                      deliveryTime: product.deliveryTime,
                      condition: product.condition,
                      specifications: product.specifications,
                    }}
                    onAddToCart={() =>
                      addToCartMutation.mutate({
                        productId: product._id,
                        quantity: 1,
                      })
                    }
                  />
                ))}
          </div>

          {isFetchingNextPage && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border border-gray-200">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium text-gray-700">Loading more products...</span>
              </div>
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <PackageSearch className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No Products Found
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {searchTerm
                  ? `No products match "${searchTerm}"`
                  : "No products match the selected filters"}
              </p>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="hover:bg-primary hover:text-white transition-all duration-200 px-6 py-3 text-base"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          <div ref={ref} className="h-px" />
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;

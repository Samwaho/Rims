"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/hooks/useDebounce";
import { ProductCard } from "@/components/ProductCard";
import { FilterAccordion } from "@/components/FilterAccordion";
import { Loader2, AlertCircle, PackageSearch } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { Product, FilterState, ProductCategory } from "@/types/product";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PRODUCT_TYPES, formatPrice } from "@/lib/utils";

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
  } = useProducts(debouncedSearchTerm);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const products = useMemo(() => {
    return productsData?.pages.flatMap((page) => page.products) ?? [];
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

        const categoryMatch =
          categoryFilters.length === 0 ||
          categoryFilters.includes("general") ||
          categoryFilters.includes(category);

        const typeMatch =
          typeFilters.length === 0 || typeFilters.includes(productType);

        return (
          (sizeFilters.length === 0 || sizeFilters.includes(size)) &&
          categoryMatch &&
          typeMatch &&
          (!priceRange || (price >= priceRange[0] && price <= priceRange[1])) &&
          name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [products, filters, debouncedSearchTerm]);

  const maxPrice = useMemo(
    () => Math.max(...products.map((product) => product.price)),
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "An error occurred while loading products"}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => refetch()}
            className="bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
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

      <section className="py-4">
        <div className="container mx-auto px-4">
          {(filters.size.length > 0 ||
            filters.category.length > 0 ||
            filters.productType.length > 0 ||
            filters.priceRange) && (
            <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Active filters:
                </span>
                {filters.category.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {cat}
                    <button
                      onClick={() => onFilterChange("category", cat)}
                      className="ml-1 hover:text-primary/80"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.productType.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {type === "oem" ? "OEM" : type}
                    <button
                      onClick={() => onFilterChange("productType", type)}
                      className="ml-1 hover:text-primary/80"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.size.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {size}
                    <button
                      onClick={() => onFilterChange("size", size)}
                      className="ml-1 hover:text-primary/80"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.priceRange && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {formatPrice(filters.priceRange[0])} -{" "}
                    {formatPrice(filters.priceRange[1])}
                    <button
                      onClick={() => onPriceRangeChange(undefined)}
                      className="ml-1 hover:text-primary/80"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="ml-auto text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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
            <div className="flex justify-center mt-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <PackageSearch className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Products Found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? `No products match "${searchTerm}"`
                  : "No products match the selected filters"}
              </p>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="hover:bg-primary hover:text-white transition-colors"
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

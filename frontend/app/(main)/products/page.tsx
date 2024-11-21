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
import { Product, FilterState } from "@/types/product";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const PRODUCTS_PER_PAGE = 12;

export const dynamic = "force-dynamic";

const ProductsPage = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const [filters, setFilters] = useState<FilterState>({
    size: [],
    category: searchParams.get("category")
      ? [searchParams.get("category") as "wheels" | "tyres"]
      : [],
    priceRange: undefined,
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
        const { size, category, price, name } = product;
        const {
          size: sizeFilters,
          category: categoryFilters,
          priceRange,
        } = filters;

        const categoryMatch =
          categoryFilters.length === 0 ||
          categoryFilters.includes(category as "general" | "wheels" | "tyres");

        return (
          (sizeFilters.length === 0 || sizeFilters.includes(size)) &&
          categoryMatch &&
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
    });
    setSearchTerm("");
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
      <ProductsHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <section className="py-8 md:py-12">
        <div className="mx-auto px-2">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <FilterAccordion
              isLoading={isLoading}
              filters={{
                size: filters.size,
                category: filters.category,
                priceRange: filters.priceRange as [number, number] | undefined,
              }}
              products={products as Product[]}
              maxPrice={maxPrice}
              onFilterChange={(type: "size" | "category", value: string) => {
                setFilters((prev) => {
                  if (type === "category") {
                    const categoryValue = value as
                      | "general"
                      | "wheels"
                      | "tyres";
                    return {
                      ...prev,
                      category: prev.category.includes(categoryValue)
                        ? prev.category.filter((item) => item !== categoryValue)
                        : [...prev.category, categoryValue],
                    };
                  }
                  return {
                    ...prev,
                    size: prev.size.includes(value)
                      ? prev.size.filter((item) => item !== value)
                      : [...prev.size, value],
                  };
                });
              }}
              onPriceRangeChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  priceRange: value,
                }));
              }}
            />

            <div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import axios from "axios";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { axiosHeaders } from "@/lib/actions";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/hooks/useDebounce";
import { ProductCard } from "@/components/ProductCard";
import { FilterAccordion } from "@/components/FilterAccordion";

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  images: string[];
  createdAt: string;
}

const fetchProducts = async (
  pageParam: number,
  productsPerPage: number
): Promise<{ products: Product[]; totalPages: number }> => {
  const response = await axios.get(
    `http://localhost:3001/api/products?page=${pageParam}&limit=${productsPerPage}`
  );
  console.log(response.data);
  return response.data;
};

const PRODUCTS_PER_PAGE = 8; // Number of products to load per page

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();

  const {
    data: productsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products"],
    queryFn: ({ pageParam = 1 }) => fetchProducts(pageParam, PRODUCTS_PER_PAGE),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.products.length === PRODUCTS_PER_PAGE &&
        allPages.length < lastPage.totalPages
        ? allPages.length + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const products = useMemo(() => {
    return productsData?.pages.flatMap((page) => page.products) ?? [];
  }, [productsData]);

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      await axios.post(
        "http://localhost:3001/api/cart",
        { productId, quantity },
        await axiosHeaders()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Product added to cart");
    },
    onError: () => {
      toast.error("Failed to add product to cart");
    },
  });

  const handleAddToCart = (productId: string) => {
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    brand: string[];
    category: string[];
    priceRange?: [number, number];
  }>({
    brand: [],
    category: [],
    priceRange: undefined,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product: Product) => {
        const { brand, category, price, name } = product;
        const {
          brand: brandFilters,
          category: categoryFilters,
          priceRange,
        } = filters;

        const brandMatch =
          brandFilters.length === 0 || brandFilters.includes(brand);
        const categoryMatch =
          categoryFilters.length === 0 || categoryFilters.includes(category);
        const priceMatch =
          !priceRange || (price >= priceRange[0] && price <= priceRange[1]);
        const searchMatch = name
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

        return brandMatch && categoryMatch && priceMatch && searchMatch;
      })
      .sort(
        (a: Product, b: Product) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [products, filters, debouncedSearchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (type: "brand" | "category", value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [type]: prevFilters[type].includes(value)
        ? prevFilters[type].filter((item) => item !== value)
        : [...prevFilters[type], value],
    }));
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      priceRange: [value[0], value[1]],
    }));
  };

  const maxPrice = useMemo(
    () => Math.max(...products.map((product: Product) => product.price)),
    [products]
  );

  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  return (
    <div className="w-full">
      <section className="bg-primary-foreground py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="md:w-1/2">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                Find the Perfect Products
              </h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">
                Browse our wide selection of high-quality products for your
                needs.
              </p>
            </div>
            <div className="md:w-1/2">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full bg-background px-4 py-2 rounded-md border border-input focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
            <FilterAccordion
              isLoading={isLoading}
              filters={filters}
              products={products}
              maxPrice={maxPrice}
              onFilterChange={handleFilterChange}
              onPriceRangeChange={handlePriceRangeChange}
            />
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {isLoading
                ? Array(PRODUCTS_PER_PAGE)
                    .fill(0)
                    .map((_, index) => <ProductCard.Skeleton key={index} />)
                : filteredProducts.map((product: Product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={() => handleAddToCart(product._id)}
                    />
                  ))}
              {isFetchingNextPage &&
                Array(PRODUCTS_PER_PAGE)
                  .fill(0)
                  .map((_, index) => (
                    <ProductCard.Skeleton key={`loading-${index}`} />
                  ))}
              <div ref={ref} style={{ height: "1px" }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;

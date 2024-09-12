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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { axiosHeaders } from "@/lib/actions";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  images: string[];
  createdAt: string;
}

const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get("http://localhost:3001/api/products");
  return response.data;
};

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

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
    priceRange: [number, number];
  }>({
    brand: [],
    category: [],
    priceRange: [0, 50000],
  });

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const brandMatch =
          filters.brand.length === 0 || filters.brand.includes(product.brand);
        const categoryMatch =
          filters.category.length === 0 ||
          filters.category.includes(product.category);
        const priceMatch =
          product.price >= filters.priceRange[0] &&
          product.price <= filters.priceRange[1];
        const searchMatch = product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return brandMatch && categoryMatch && priceMatch && searchMatch;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [products, filters, searchTerm]);

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

  const maxPrice = useMemo(() => {
    return Math.max(...products.map((product) => product.price));
  }, [products]);

  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div className="w-full">
      <section className="bg-primary-foreground py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Find the Perfect Products
              </h1>
              <p className="text-muted-foreground mt-4 text-lg">
                Browse our wide selection of high-quality products for your
                needs.
              </p>
            </div>
            <div>
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
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
            <div className="space-y-6">
              <Accordion type="single" collapsible>
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
                              className="flex items-center gap-2 font-normal"
                            >
                              <Checkbox
                                checked={filters.brand.includes(brand)}
                                onCheckedChange={() =>
                                  handleFilterChange("brand", brand)
                                }
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
                        : ["general", "wheel", "rim"].map((category) => (
                            <Label
                              key={category}
                              className="flex items-center gap-2 font-normal"
                            >
                              <Checkbox
                                checked={filters.category.includes(category)}
                                onCheckedChange={() =>
                                  handleFilterChange("category", category)
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
                          value={[filters.priceRange[0], filters.priceRange[1]]}
                          onValueChange={handlePriceRangeChange}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                          <span>{formatPrice(filters.priceRange[0])}</span>
                          <span>{formatPrice(filters.priceRange[1])}</span>
                        </div>
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading
                ? Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="bg-background rounded-md overflow-hidden shadow-sm"
                      >
                        <Skeleton className="w-full h-48" />
                        <div className="p-4">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2 mb-4" />
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-8 w-1/3" />
                          </div>
                        </div>
                      </div>
                    ))
                : filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-background rounded-md overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                    >
                      <Link href={`/products/${product._id}`}>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover"
                          style={{ aspectRatio: "300/200", objectFit: "cover" }}
                        />
                        <div className="p-4">
                          <h3 className="text-lg font-medium">
                            {product.name}
                          </h3>
                          <p className="text-muted-foreground">
                            {product.brand} - {product.category}
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-2xl font-bold">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </div>
                      </Link>
                      <div className="px-4 pb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-primary text-primary-foreground hover:opacity-80"
                          onClick={() => handleAddToCart(product._id)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;

"use client";

import React, { useState, useMemo } from "react";
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

const TyresPage = () => {
  const products = [
    {
      id: 1,
      image: "/placeholder.svg",
      title: "All-Season Radial Tires",
      brand: "Michelin",
      size: "215/55R17",
      price: 99.99,
    },
    {
      id: 2,
      image: "/placeholder.svg",
      title: "High-Performance Tires",
      brand: "Pirelli",
      size: "225/45R18",
      price: 129.99,
    },
    {
      id: 3,
      image: "/placeholder.svg",
      title: "All-Terrain Truck Tires",
      brand: "Goodyear",
      size: "265/70R17",
      price: 149.99,
    },
    {
      id: 4,
      image: "/placeholder.svg",
      title: "Lightweight Alloy Wheels",
      brand: "Enkei",
      size: "17x8",
      price: 199.99,
    },
    {
      id: 5,
      image: "/placeholder.svg",
      title: "Heavy-Duty Steel Wheels",
      brand: "Vision",
      size: "16x8",
      price: 99.99,
    },
    {
      id: 6,
      image: "/placeholder.svg",
      title: "Chrome Plated Wheels",
      brand: "Focal",
      size: "20x9",
      price: 299.99,
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    brand: string[];
    size: string[];
    priceRange: number[];
  }>({
    brand: [],
    size: [],
    priceRange: [0, 500],
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const brandMatch =
        filters.brand.length === 0 || filters.brand.includes(product.brand);
      const sizeMatch =
        filters.size.length === 0 || filters.size.includes(product.size);
      const priceMatch =
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1];
      const searchMatch = product.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return brandMatch && sizeMatch && priceMatch && searchMatch;
    });
  }, [products, filters, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (type: "brand" | "size", value: string) => {
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
      priceRange: value,
    }));
  };

  return (
    <div className="w-full">
      <section className="bg-primary-foreground py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Find the Perfect Tires and Wheels
              </h1>
              <p className="text-muted-foreground mt-4 text-lg">
                Browse our wide selection of high-quality tires and wheels for
                your vehicle.
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
                      {[
                        "Michelin",
                        "Pirelli",
                        "Goodyear",
                        "Enkei",
                        "Vision",
                        "Focal",
                      ].map((brand) => (
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
                <AccordionItem value="size">
                  <AccordionTrigger className="text-base font-medium">
                    Size
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2">
                      {[
                        "215/55R17",
                        "225/45R18",
                        "265/70R17",
                        "17x8",
                        "16x8",
                        "20x9",
                      ].map((size) => (
                        <Label
                          key={size}
                          className="flex items-center gap-2 font-normal"
                        >
                          <Checkbox
                            checked={filters.size.includes(size)}
                            onCheckedChange={() =>
                              handleFilterChange("size", size)
                            }
                          />
                          {size}
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
                    <div className="w-full" />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-background rounded-md overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                    style={{ aspectRatio: "300/200", objectFit: "cover" }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-medium">{product.title}</h3>
                    <p className="text-muted-foreground">
                      {product.brand} - {product.size}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      <Button variant="outline" size="sm">
                        Add to Cart
                      </Button>
                    </div>
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

export default TyresPage;

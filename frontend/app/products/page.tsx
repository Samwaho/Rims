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
import { formatPrice } from "@/lib/utils";

// Sample data
const sampleProducts = [
  {
    _id: "1",
    name: "Sport Wheel X1",
    brand: "SpeedMaster",
    category: "wheel",
    price: 12000,
    images: ["https://example.com/wheel1.jpg"],
  },
  {
    _id: "2",
    name: "Alloy Rim R2",
    brand: "RimKing",
    category: "rim",
    price: 8000,
    images: ["https://example.com/rim1.jpg"],
  },
  {
    _id: "3",
    name: "Off-Road Tire T3",
    brand: "TerrainMaster",
    category: "general",
    price: 15000,
    images: ["https://example.com/tire1.jpg"],
  },
  // Add more sample products as needed
];

const ProductsPage = () => {
  const [products] = useState(sampleProducts);
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
    return products.filter((product) => {
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
    });
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

  const handlePriceRangeChange = (value: [number, number]) => {
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
                      {Array.from(
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
                      {["general", "wheel", "rim"].map((category) => (
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
                    <div className="w-full" />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{formatPrice(filters.priceRange[0])}</span>
                      <span>{formatPrice(filters.priceRange[1])}</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-background rounded-md overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                    style={{ aspectRatio: "300/200", objectFit: "cover" }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    <p className="text-muted-foreground">
                      {product.brand} - {product.category}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-bold">
                        {formatPrice(product.price)}
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

export default ProductsPage;

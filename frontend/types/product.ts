import { ProductCategory } from "@/lib/utils";

// Base specification type used across product-related interfaces
export interface Specification {
  name: string;
  value: string;
}

// Review type to avoid using any[]
export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  createdAt: string;
}

// Main product interface with strict typing
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  brand: string;
  madeIn: string;
  images: string[];
  specifications: Specification[];
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}

// Product filter state with precise types
export interface FilterState {
  brand: string[];
  category: ProductCategory[]; // Match product categories
  priceRange?: readonly [number, number]; // Readonly tuple for range
}

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
  buyingPrice: number;
  shippingCost: number;
  deliveryTime: string;
  stock: number;
  category: "general" | "wheels" | "tyres";
  size: string;
  madeIn: string;
  images: string[];
  specifications: Specification[];
  reviews: Review[];
  numReviews: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

// Product filter state with precise types
export interface FilterState {
  size: string[];
  category: ProductCategory[];
  priceRange?: readonly [number, number];
}

// Update the ProductFormValues interface
export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: "general" | "wheels" | "tyres";
  size: string;
  madeIn: string;
  images: any;
  specifications: Specification[];
}

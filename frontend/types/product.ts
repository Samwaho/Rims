import { z } from "zod";
import { PRODUCT_CATEGORIES, PRODUCT_TYPES } from "@/lib/utils";

// Base specification type used across product-related interfaces
export interface Specification {
  name: string;
  value: string;
}

// Review type to avoid using any[]
export interface Review {
  _id: string;
  user: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

// Price details interface
export interface PriceDetails {
  basePrice: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
}

// Product category type
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

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
  images: string[];
  category: ProductCategory;
  productType: (typeof PRODUCT_TYPES)[number];
  size: string;
  madeIn: string;
  specifications: Specification[];
  reviews: Review[];
  numReviews: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  priceDetails?: PriceDetails;
  condition?: string;
}

// Product filter state with precise types
export interface FilterState {
  size: string[];
  category: ProductCategory[];
  priceRange?: readonly [number, number];
  productType: (typeof PRODUCT_TYPES)[number][];
}

// Update the ProductFormValues interface
export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  productType: (typeof PRODUCT_TYPES)[number];
  size: string;
  madeIn: string;
  images: any;
  specifications: Specification[];
  buyingPrice: number;
  shippingCost: number;
  deliveryTime: string;
}

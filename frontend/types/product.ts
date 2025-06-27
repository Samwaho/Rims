import { z } from "zod";
import { PRODUCT_CATEGORIES, PRODUCT_TYPES } from "@/lib/utils";

// Base specification type used across product-related interfaces
export interface Specification {
  name: string;
  value: string;
}

// Review interface
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

// Product type from PRODUCT_TYPES
export type ProductType = (typeof PRODUCT_TYPES)[number];

// Product condition type
export type ProductCondition = "new" | "used";

// Category-specific field interfaces
export interface RimFields {
  wheelDiameter: number;
  wheelWidth: number;
  offset: number;
  boltPattern: string;
}

export interface TyreFields {
  loadIndex: string;
  speedRating: string;
  treadDepth: number;
}

export interface CarFields {
  year: number;
  mileage: number;
  fuelType: "petrol" | "diesel" | "electric" | "hybrid" | "lpg";
  transmission: "manual" | "automatic" | "cvt";
}

export interface AccessoryFields {
  compatibility: string[];
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
  images: string[];
  category: ProductCategory;
  productType: ProductType;
  size?: string; // Optional for accessories and cars
  madeIn?: string;
  specifications: Specification[];
  reviews: Review[];
  numReviews: number;
  averageRating: number;
  condition: ProductCondition;
  createdAt: string;
  updatedAt: string;
  priceDetails?: PriceDetails;
  
  // Category-specific fields
  brand?: string;
  model?: string;
  
  // Rim-specific fields
  wheelDiameter?: number;
  wheelWidth?: number;
  offset?: number;
  boltPattern?: string;
  
  // Tyre-specific fields
  loadIndex?: string;
  speedRating?: string;
  treadDepth?: number;
  
  // Car-specific fields
  year?: number;
  mileage?: number;
  fuelType?: "petrol" | "diesel" | "electric" | "hybrid" | "lpg";
  transmission?: "manual" | "automatic" | "cvt";
  
  // Accessory-specific fields
  compatibility?: string[];
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
  productType: ProductType;
  size?: string;
  madeIn?: string;
  images: any;
  specifications: Specification[];
  buyingPrice: number;
  shippingCost: number;
  deliveryTime: string;
  condition?: ProductCondition;
  
  // Category-specific fields
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuelType?: "petrol" | "diesel" | "electric" | "hybrid" | "lpg";
  transmission?: "manual" | "automatic" | "cvt";
  wheelDiameter?: number;
  wheelWidth?: number;
  offset?: number;
  boltPattern?: string;
  loadIndex?: string;
  speedRating?: string;
  treadDepth?: number;
  compatibility?: string[];
}

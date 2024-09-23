import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(price);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-KE", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat("en-KE").format(number);
}

export function formatPercentage(number: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

export function formatCurrency(currency: string, amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export const signUpSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
    phoneNumber: z.string().optional(),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        county: z.string().optional(),
        postalCode: z.string().optional(),
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  category: z.enum(["general", "wheels", "tyres"]),
  brand: z.string().min(1, "Brand is required"),
  specifications: z.array(
    z.object({
      name: z.string().min(1, "Specification name is required"),
      value: z.string().min(1, "Specification value is required"),
    })
  ),
});

// Additional validation for wheel and rim product types can be handled in the form logic
// as the product model doesn't have separate schemas for different product types

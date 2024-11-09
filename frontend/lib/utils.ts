import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

// Utility for merging Tailwind CSS classes
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Cached formatters for better performance
const priceFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
});

const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const numberFormatter = new Intl.NumberFormat("en-KE");

const percentFormatter = new Intl.NumberFormat("en-KE", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Formatting utilities using cached formatters
export const formatPrice = (price: number) => priceFormatter.format(price);
export const formatDate = (date: Date) => dateFormatter.format(date);
export const formatNumber = (number: number) => numberFormatter.format(number);
export const formatPercentage = (number: number) =>
  percentFormatter.format(number);

// Memoized currency formatter
const currencyFormatters = new Map<string, Intl.NumberFormat>();
export const formatCurrency = (currency: string, amount: number) => {
  if (!currencyFormatters.has(currency)) {
    currencyFormatters.set(
      currency,
      new Intl.NumberFormat("en-KE", { style: "currency", currency })
    );
  }
  return currencyFormatters.get(currency)!.format(amount);
};

// Validation schemas with reusable parts
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  postalCode: z.string().optional(),
});

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long");

export const signUpSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    phoneNumber: z.string().optional(),
    address: addressSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
});

const specificationSchema = z.object({
  name: z.string().min(1, "Specification name is required"),
  value: z.string().min(1, "Specification value is required"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  stock: z.coerce.number().int().min(0, "Stock must be a non-negative integer"),
  images: z.array(z.instanceof(File)).min(1, "At least one image is required"),
  category: z.enum(["general", "wheels", "tyres"]),
  brand: z.string().min(1, "Brand is required"),
  madeIn: z.string().min(1, "Made in is required"),
  specifications: z.array(specificationSchema),
});

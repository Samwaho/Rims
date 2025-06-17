import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

// Utility for merging Tailwind CSS classes
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Cached formatters for better performance
const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const numberFormatter = new Intl.NumberFormat("en-US");

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Formatting utilities using cached formatters
export const formatPrice = (price: number) => priceFormatter.format(price);
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "Date not available";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    return dateFormatter.format(dateObj);
  } catch (error) {
    return "Invalid date";
  }
};
export const formatNumber = (number: number) => numberFormatter.format(number);
export const formatPercentage = (number: number) =>
  percentFormatter.format(number);

// Memoized currency formatter
const currencyFormatters = new Map<string, Intl.NumberFormat>();
export const formatCurrency = (currency: string, amount: number) => {
  if (!currencyFormatters.has(currency)) {
    currencyFormatters.set(
      currency,
      new Intl.NumberFormat("en-US", { style: "currency", currency })
    );
  }
  return currencyFormatters.get(currency)!.format(amount);
};
// Updated validation schemas
const contactInfoSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

const deliveryPointSchema = z.object({
  _id: z.string(),
  name: z.string(),
  location: z.string(),
  operatingHours: z.string().optional(),
  contactInfo: contactInfoSchema.optional(),
});

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long");

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  postalCode: z.string().optional(),
});

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

export const PRODUCT_CATEGORIES = ["tyres", "wheels", "general"] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_TYPES = ["oem", "aftermarket", "alloy"] as const;

export const PRODUCT_CONDITIONS = ["new", "used"] as const;

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be a positive number"),
  buyingPrice: z.number().min(0, "Buying price must be a positive number"),
  shippingCost: z.number().min(0, "Shipping cost must be a positive number"),
  deliveryTime: z.string().min(1, "Delivery time is required"),
  stock: z.number().int().min(0, "Stock must be a positive integer"),
  category: z.enum(["general", "wheels", "tyres"] as const),
  size: z.string().min(1, "Size is required"),
  madeIn: z.string().optional(),
  images: z.any(),
  specifications: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
  productType: z.enum(PRODUCT_TYPES),
  condition: z.enum(PRODUCT_CONDITIONS).optional(),
});

// Add order-related schemas
export const orderSchema = z.object({
  deliveryPointId: z.string().min(1, "Delivery point is required"),
  paymentMethod: z.enum(["mpesa", "bank"]),
  paymentDetails: z.union([
    z.object({
      mpesaNumber: z.string().regex(/^254\d{9}$/, "Invalid Mpesa number"),
    }),
    z.object({
      accountNumber: z.string().min(1, "Account number is required"),
      bankName: z.string().min(1, "Bank name is required"),
      accountHolder: z.string().min(1, "Account holder name is required"),
    }),
  ]),
  discountCode: z.string().optional(),
});

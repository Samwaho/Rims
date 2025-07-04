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

export const PRODUCT_CATEGORIES = ["rims", "offroad-rims", "tyres", "accessories", "cars"] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_TYPES = ["oem", "aftermarket", "alloy"] as const;

export const PRODUCT_CONDITIONS = ["new", "used"] as const;

// Category-specific specifications
export const CATEGORY_SPECIFICATIONS = {
  rims: [
    { name: "Brand", value: "" },
    { name: "Model", value: "" },
    { name: "Wheel Diameter", value: "" },
    { name: "Wheel Width", value: "" },
    { name: "Offset", value: "" },
    { name: "Hub Bore", value: "" },
    { name: "Bolt Pattern", value: "" },
    { name: "Wheel Material", value: "" },
    { name: "Color", value: "" },
    { name: "Finish", value: "" },
  ],
  "offroad-rims": [
    { name: "Brand", value: "" },
    { name: "Model", value: "" },
    { name: "Wheel Diameter", value: "" },
    { name: "Wheel Width", value: "" },
    { name: "Offset", value: "" },
    { name: "Hub Bore", value: "" },
    { name: "Bolt Pattern", value: "" },
    { name: "Wheel Material", value: "" },
    { name: "Color", value: "" },
    { name: "Finish", value: "" },
    { name: "Load Rating", value: "" },
    { name: "Beadlock", value: "" },
  ],
  tyres: [
    { name: "Brand", value: "" },
    { name: "Model", value: "" },
    { name: "Size", value: "" },
    { name: "Load Index", value: "" },
    { name: "Speed Rating", value: "" },
    { name: "Tread Pattern", value: "" },
    { name: "Tread Depth", value: "" },
    { name: "Tyre Type", value: "" },
    { name: "Season", value: "" },
    { name: "Run Flat", value: "" },
  ],
  accessories: [
    { name: "Brand", value: "" },
    { name: "Model", value: "" },
    { name: "Compatibility", value: "" },
    { name: "Material", value: "" },
    { name: "Color", value: "" },
    { name: "Weight", value: "" },
    { name: "Dimensions", value: "" },
  ],
  cars: [
    { name: "Brand", value: "" },
    { name: "Model", value: "" },
    { name: "Year", value: "" },
    { name: "Mileage", value: "" },
    { name: "Fuel Type", value: "" },
    { name: "Transmission", value: "" },
    { name: "Engine Size", value: "" },
    { name: "Color", value: "" },
    { name: "Body Type", value: "" },
    { name: "Doors", value: "" },
    { name: "Seats", value: "" },
  ],
} as const;

// Base product schema
const baseProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be a positive number"),
  buyingPrice: z.number().min(0, "Buying price must be a positive number"),
  shippingCost: z.number().min(0, "Shipping cost must be a positive number"),
  deliveryTime: z.string().min(1, "Delivery time is required"),
  stock: z.number().int().min(0, "Stock must be a positive integer"),
  category: z.enum(PRODUCT_CATEGORIES),
  madeIn: z.string().optional(),
  images: z.any(),
  specifications: z.array(specificationSchema),
  productType: z.enum(PRODUCT_TYPES),
  condition: z.enum(PRODUCT_CONDITIONS).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
});

// Category-specific schemas
const rimSchema = baseProductSchema.extend({
  category: z.literal("rims"),
  size: z.string().min(1, "Size is required for rims"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  wheelDiameter: z.number().min(13).max(26),
  wheelWidth: z.number().min(4).max(15),
  offset: z.number(),
  boltPattern: z.string().min(1, "Bolt pattern is required"),
});

const offroadRimSchema = baseProductSchema.extend({
  category: z.literal("offroad-rims"),
  size: z.string().min(1, "Size is required for offroad rims"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  wheelDiameter: z.number().min(13).max(26),
  wheelWidth: z.number().min(4).max(15),
  offset: z.number(),
  boltPattern: z.string().min(1, "Bolt pattern is required"),
});

const tyreSchema = baseProductSchema.extend({
  category: z.literal("tyres"),
  size: z.string().min(1, "Size is required for tyres"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  loadIndex: z.string().min(1, "Load index is required"),
  speedRating: z.string().min(1, "Speed rating is required"),
  treadDepth: z.number().min(0, "Tread depth must be positive"),
});

const accessorySchema = baseProductSchema.extend({
  category: z.literal("accessories"),
  size: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  compatibility: z.array(z.string()).min(1, "At least one compatibility option is required"),
});

const carSchema = baseProductSchema.extend({
  category: z.literal("cars"),
  size: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().min(0, "Mileage must be positive"),
  fuelType: z.enum(["petrol", "diesel", "electric", "hybrid", "lpg"]),
  transmission: z.enum(["manual", "automatic", "cvt"]),
});

// Union schema for all categories
export const productSchema = z.discriminatedUnion("category", [
  rimSchema,
  offroadRimSchema,
  tyreSchema,
  accessorySchema,
  carSchema,
]);

// Helper function to get category-specific schema
export const getCategorySchema = (category: ProductCategory) => {
  switch (category) {
    case "rims":
      return rimSchema;
    case "offroad-rims":
      return offroadRimSchema;
    case "tyres":
      return tyreSchema;
    case "accessories":
      return accessorySchema;
    case "cars":
      return carSchema;
    default:
      return baseProductSchema;
  }
};

// Helper function to get category-specific specifications
export const getCategorySpecifications = (category: ProductCategory) => {
  return CATEGORY_SPECIFICATIONS[category] || [];
};

// Helper function to check if a field is required for a category
export const isFieldRequired = (field: string, category: ProductCategory) => {
  const schema = getCategorySchema(category);
  const fieldSchema = schema.shape[field as keyof typeof schema.shape];
  
  if (!fieldSchema) return false;
  
  // Check if the field is required in the schema
  if (fieldSchema instanceof z.ZodOptional) {
    return false;
  }
  
  return true;
};

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

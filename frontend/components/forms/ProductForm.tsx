"use client";

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, X, ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { productSchema, getCategorySpecifications, isFieldRequired } from "@/lib/utils";
import { memo, useEffect, useState } from "react";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  PRODUCT_CONDITIONS,
} from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export type ProductFormValues = z.infer<typeof productSchema> & {
  images: File[];
  buyingPrice: number;
  shippingCost: number;
  deliveryTime: string;
  productType: string;
  condition: string;
  // Category-specific fields
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  wheelDiameter?: number;
  wheelWidth?: number;
  offset?: number;
  boltPattern?: string;
  loadIndex?: string;
  speedRating?: string;
  treadDepth?: number;
  compatibility?: string[];
};

export interface Specification {
  name: string;
  value: string;
}

interface ProductFormProps {
  form: UseFormReturn<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  imagePreview: string[];
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  isUploading: boolean;
  title: string;
  description: string;
  submitLabel: string;
  onBack?: () => void;
  removeImage?: (index: number) => void;
  setIsDirty?: (isDirty: boolean) => void;
  existingImages?: string[];
}

const ImagePreview = memo(
  ({
    url,
    index,
    removeImage,
    isExisting,
  }: {
    url: string;
    index: number;
    removeImage?: (index: number) => void;
    isExisting?: boolean;
  }) => (
    <div className="relative group aspect-square">
      <img
        src={url}
        alt={`Preview ${index + 1}`}
        className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-200 group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
      {removeImage && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => removeImage(index)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      {isExisting && (
        <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Existing Image
        </span>
      )}
    </div>
  )
);

ImagePreview.displayName = "ImagePreview";

const SpecificationField = memo(
  ({
    spec,
    index,
    onNameChange,
    onValueChange,
    onRemove,
  }: {
    spec: Specification;
    index: number;
    onNameChange: (value: string) => void;
    onValueChange: (value: string) => void;
    onRemove: () => void;
  }) => (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-white shadow-sm">
      <div className="flex-1">
        <Input
          placeholder="Specification name"
          value={spec.name || ""}
          onChange={(e) => onNameChange(e.target.value)}
          className="h-11 focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex-1">
        <Input
          placeholder="Specification value"
          value={spec.value || ""}
          onChange={(e) => onValueChange(e.target.value)}
          className="h-11 focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={onRemove}
        className="sm:mt-0 hover:bg-red-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
);

SpecificationField.displayName = "SpecificationField";

const formatNumberWithCommas = (value: string) => {
  const cleanValue = value.replace(/[^0-9.]/g, "");
  const parts = cleanValue.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

// Compatibility options for accessories
const COMPATIBILITY_OPTIONS = [
  "Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes", "Audi", 
  "Volkswagen", "Hyundai", "Kia", "Mazda", "Subaru", "Lexus", "Acura", "Infiniti",
  "Universal", "Custom"
];

export const ProductForm = memo(function ProductForm({
  form,
  onSubmit,
  imagePreview,
  handleImageChange,
  isSubmitting,
  isUploading,
  title,
  description,
  submitLabel,
  onBack,
  removeImage,
  setIsDirty,
  existingImages,
}: ProductFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    if (existingImages?.length) {
      const dummyFiles = existingImages.map(
        (url) => new File([], url, { type: "image/jpeg" })
      );
      form.setValue("images", dummyFiles);
    }
  }, [existingImages, form]);

  const addSpecification = () => {
    const currentSpecs = form.getValues("specifications") || [];
    form.setValue("specifications", [
      ...currentSpecs,
      { name: "", value: "" },
    ]);
    setIsDirty?.(true);
  };

  const removeSpecification = (index: number) => {
    const currentSpecs = form.getValues("specifications") || [];
    form.setValue(
      "specifications",
      currentSpecs.filter((_, i) => i !== index)
    );
    setIsDirty?.(true);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setIsDirty?.(true);
  };

  const loadTemplateSpecifications = (category: string) => {
    const templateSpecs = getCategorySpecifications(category as any) || [];
    // Create a mutable copy of the readonly array
    const mutableSpecs = templateSpecs.map(spec => ({ ...spec }));
    form.setValue("specifications", mutableSpecs, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setIsDirty?.(true);
  };

  const renderCategorySpecificFields = () => {
    const category = form.watch("category");
    
    if (!category) return null;

    switch (category) {
      case "rims":
      case "offroad-rims":
        return (
          <>
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Brand *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter brand name"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Model *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter model name"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wheelDiameter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Wheel Diameter (inches) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g., 18"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wheelWidth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Wheel Width (inches) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g., 8.5"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="offset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Offset (mm) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g., 35"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="boltPattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Bolt Pattern *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 5x114.3"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
          </>
        );

      case "tyres":
        return (
          <>
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Brand *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter brand name"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Model *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter model name"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loadIndex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Load Index *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 91"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="speedRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Speed Rating *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., V"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treadDepth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Tread Depth (mm) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g., 8"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
          </>
        );

      case "cars":
        return (
          <>
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Brand *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter brand name"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Model *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter model name"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Year *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g., 2020"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Mileage (km) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g., 50000"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Fuel Type *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 bg-white">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="lpg">LPG</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transmission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Transmission *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 bg-white">
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="cvt">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
          </>
        );

      case "accessories":
        return (
          <>
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Brand
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter brand name (optional)"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Model
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter model name (optional)"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <div className="col-span-2">
              <FormLabel className="text-gray-700 font-medium">
                Compatibility *
              </FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {COMPATIBILITY_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={form.watch("compatibility")?.includes(option) || false}
                      onCheckedChange={(checked) => {
                        const current = form.watch("compatibility") || [];
                        if (checked) {
                          form.setValue("compatibility", [...current, option]);
                        } else {
                          form.setValue("compatibility", current.filter(item => item !== option));
                        }
                        setIsDirty?.(true);
                      }}
                    />
                    <label
                      htmlFor={option}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="p-6 sm:p-8 shadow-xl border border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        </div>
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="text-muted-foreground hover:bg-gray-50 gap-2 border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Product Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter product name"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Category *
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategory(value);
                      loadTemplateSpecifications(value);
                      setIsDirty?.(true);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 bg-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Size field - conditional based on category */}
            {isFieldRequired("size", form.watch("category") as any) && (
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Size *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter size"
                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                        onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
            )}

            {/* Category-specific fields */}
            {renderCategorySpecificFields()}

            <FormField
              control={form.control}
              name="madeIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Origin
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter country of origin (optional)"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Buying Price (USD) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter buying price"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        const formattedValue = formatNumberWithCommas(
                          e.target.value
                        );
                        e.target.value = formattedValue;

                        const numericValue =
                          parseFloat(formattedValue.replace(/,/g, "")) || 0;
                        field.onChange(numericValue);
                        handleFieldChange(e);
                      }}
                      value={
                        field.value
                          ? formatNumberWithCommas(field.value.toString())
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Selling Price (USD) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter selling price"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        const formattedValue = formatNumberWithCommas(
                          e.target.value
                        );
                        e.target.value = formattedValue;

                        const numericValue =
                          parseFloat(formattedValue.replace(/,/g, "")) || 0;
                        field.onChange(numericValue);
                        handleFieldChange(e);
                      }}
                      value={
                        field.value
                          ? formatNumberWithCommas(field.value.toString())
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Stock Quantity *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter stock quantity"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shippingCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Shipping Cost (USD) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter shipping cost"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        const formattedValue = formatNumberWithCommas(
                          e.target.value
                        );
                        e.target.value = formattedValue;

                        const numericValue =
                          parseFloat(formattedValue.replace(/,/g, "")) || 0;
                        field.onChange(numericValue);
                        handleFieldChange(e);
                      }}
                      value={
                        field.value
                          ? formatNumberWithCommas(field.value.toString())
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Delivery Time *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 2-3 business days"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Product Type *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 bg-white">
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Condition
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 bg-white">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRODUCT_CONDITIONS.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition.charAt(0).toUpperCase() + condition.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">
                  Description *
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter product description"
                    className="min-h-[120px] focus:ring-2 focus:ring-primary/20 bg-white resize-none"
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          {/* Specifications Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Specifications
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpecification}
                className="text-primary border-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Specification
              </Button>
            </div>

            <div className="space-y-4">
              {form.watch("specifications")?.map((spec, index) => (
                <SpecificationField
                  key={index}
                  spec={spec}
                  index={index}
                  onNameChange={(value) => {
                    const currentSpecs = form.getValues("specifications") || [];
                    currentSpecs[index].name = value;
                    form.setValue("specifications", [...currentSpecs]);
                    setIsDirty?.(true);
                  }}
                  onValueChange={(value) => {
                    const currentSpecs = form.getValues("specifications") || [];
                    currentSpecs[index].value = value;
                    form.setValue("specifications", [...currentSpecs]);
                    setIsDirty?.(true);
                  }}
                  onRemove={() => removeSpecification(index)}
                />
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Images
              </h3>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Loader2 className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag
                      and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imagePreview.map((url, index) => (
                  <ImagePreview
                    key={index}
                    url={url}
                    index={index}
                    removeImage={removeImage}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="px-8"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-8"
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploading ? "Uploading..." : "Saving..."}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
});

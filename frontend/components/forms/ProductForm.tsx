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
import { productSchema } from "@/lib/utils";
import { memo, useEffect } from "react";
import { PRODUCT_CATEGORIES, PRODUCT_TYPES } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export type ProductFormValues = z.infer<typeof productSchema> & {
  images: File[];
  buyingPrice: number;
  shippingCost: number;
  deliveryTime: string;
  productType: string;
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
    form.setValue("specifications", [...currentSpecs, { name: "", value: "" }]);
    setIsDirty?.(true);
  };

  const removeSpecification = (index: number) => {
    const currentSpecs = form.getValues("specifications");
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

            <FormField
              control={form.control}
              name="madeIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Origin *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter country of origin"
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
                    Buying Price (KES) *
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
                    Selling Price (KES) *
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
                        const value = e.target.value
                          ? Number(e.target.value)
                          : 0;
                        field.onChange(value);
                        handleFieldChange(e);
                      }}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-gray-700 font-medium">
                    Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter product description"
                      className="min-h-[120px] focus:ring-2 focus:ring-primary/20 resize-y bg-white"
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
                    onValueChange={field.onChange}
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
                          {category}
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
              name="shippingCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Shipping Cost (KES) *
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
          </div>

          <fieldset className="space-y-4 border border-gray-200 p-6 rounded-xl bg-gray-50/50">
            <legend className="text-lg font-semibold px-2 text-gray-700">
              Product Images {imagePreview.length === 0 && "*"}
            </legend>
            <div className="space-y-4">
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="h-12 cursor-pointer focus:ring-2 focus:ring-primary/20 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 transition-colors"
              />
              <p className="text-sm text-muted-foreground">
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreview.map((url, index) => (
                    <ImagePreview
                      key={url}
                      url={url}
                      index={index}
                      removeImage={removeImage}
                      isExisting={
                        existingImages && index < existingImages.length
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-4 border border-gray-200 p-6 rounded-xl bg-gray-50/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <legend className="text-lg font-semibold px-2 text-gray-700">
                Specifications
              </legend>
              <Button
                type="button"
                variant="outline"
                onClick={addSpecification}
                className="text-sm hover:bg-primary/10 transition-colors border-primary/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Specification
              </Button>
            </div>

            <div className="space-y-4">
              {form.watch("specifications").map((spec, index) => (
                <SpecificationField
                  key={index}
                  spec={spec}
                  index={index}
                  onNameChange={(value) => {
                    form.setValue(`specifications.${index}.name`, value);
                    setIsDirty?.(true);
                  }}
                  onValueChange={(value) => {
                    form.setValue(`specifications.${index}.value`, value);
                    setIsDirty?.(true);
                  }}
                  onRemove={() => removeSpecification(index)}
                />
              ))}
            </div>
          </fieldset>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 bg-primary hover:bg-primary/90"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting || isUploading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {isUploading ? "Uploading Images..." : "Saving..."}
              </div>
            ) : (
              submitLabel
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
});

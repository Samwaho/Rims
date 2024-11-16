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

export type ProductFormValues = z.infer<typeof productSchema> & {
  images: File[];
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
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-white">
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
    <Card className="p-6 sm:p-8 shadow-lg border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="text-muted-foreground hover:bg-gray-100 gap-2"
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
                  <FormLabel className="text-gray-700">
                    Product Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter product name"
                      className="h-11 focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Brand *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter brand name"
                      className="h-11 focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="madeIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Made In *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter country of origin"
                      className="h-11 focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Price (KES) *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter price"
                      className="h-11 focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Stock Quantity *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter stock quantity"
                      className="h-11 focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-gray-700">Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter product description"
                      className="min-h-[120px] focus:ring-2 focus:ring-primary/20 resize-y"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
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
                className="h-12 cursor-pointer focus:ring-2 focus:ring-primary/20 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file"
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
                className="text-sm hover:bg-blue-50 transition-colors"
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
            className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70"
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

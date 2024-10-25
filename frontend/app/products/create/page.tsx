"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUploadThing } from "@/lib/uploadthing";
import { useDropzone } from "react-dropzone";
import { useDebounce } from "@/hooks/useDebounce";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  category: z.enum(["general", "wheels", "tyres"]),
  brand: z.string().min(1, "Brand is required"),
  specifications: z.array(
    z.object({
      name: z.string().min(1, "Specification name is required"),
      value: z.string().min(1, "Specification value is required"),
    })
  ),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProduct() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploadingImages, setUploadingImages] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "general",
      brand: "",
      specifications: [{ name: "", value: "" }],
      images: [],
    },
  });

  const { startUpload, isUploading } = useUploadThing("productImage");

  const debouncedSetValue = useDebounce((value: any) => {
    form.setValue("images", value);
  }, 300);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploadingImages(true);
      try {
        const uploadedImages = await startUpload(acceptedFiles);
        if (uploadedImages) {
          const imageUrls = uploadedImages.map((image) => image.url);
          debouncedSetValue([...form.getValues("images"), ...imageUrls]);
        }
      } catch (error) {
        console.error("Error uploading images:", error);
        toast.error("Failed to upload one or more images");
      } finally {
        setUploadingImages(false);
      }
    },
    [form, startUpload, debouncedSetValue]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    disabled: isUploading || uploadingImages,
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
        data,
        await axiosHeaders()
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/products");
    },
    onError: (error) => {
      toast.error("Error creating product");
      console.error("Error creating product:", error);
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    createProductMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Create New Product</CardTitle>
        <CardDescription>
          Fill out the form below to add a new product to your store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[120px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-3">
                        {field.value.map((url, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-md overflow-hidden"
                          >
                            <img
                              src={url}
                              alt={`Product Image ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              className="absolute top-1 right-1 p-1"
                              onClick={() => {
                                const newUrls = field.value.filter(
                                  (_, i) => i !== index
                                );
                                form.setValue("images", newUrls);
                              }}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <div
                          {...getRootProps()}
                          className="flex items-center justify-center border-2 border-dashed border-muted-foreground rounded-md cursor-pointer"
                        >
                          <div className="p-4 text-center">
                            <UploadIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">
                              {isUploading || uploadingImages
                                ? "Uploading..."
                                : "Add images"}
                            </p>
                          </div>
                          <input {...getInputProps()} />
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="wheels">Wheels</SelectItem>
                        <SelectItem value="tyres">Tyres</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="specifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Specifications</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value.map((spec, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-[1fr_1fr_auto] gap-3"
                        >
                          <Input
                            placeholder="Specification name"
                            value={spec.name}
                            onChange={(e) => {
                              const newSpecs = [...field.value];
                              newSpecs[index].name = e.target.value;
                              field.onChange(newSpecs);
                            }}
                          />
                          <Input
                            placeholder="Specification value"
                            value={spec.value}
                            onChange={(e) => {
                              const newSpecs = [...field.value];
                              newSpecs[index].value = e.target.value;
                              field.onChange(newSpecs);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              const newSpecs = field.value.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newSpecs);
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          field.onChange([
                            ...field.value,
                            { name: "", value: "" },
                          ]);
                        }}
                        className="w-full"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Specification
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={createProductMutation.isPending || uploadingImages}
            >
              {createProductMutation.isPending
                ? "Creating..."
                : "Create Product"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

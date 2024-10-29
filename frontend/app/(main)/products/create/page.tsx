"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import { productSchema } from "@/lib/utils";
import { ZodError } from "zod";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    stock: 0,
    category: "",
    brand: "",
    madeIn: "",
    images: [] as File[],
    specifications: [] as { name: string; value: string }[],
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setProductData((prev) => ({
        ...prev,
        images: files,
      }));

      // Create preview URLs
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreview(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate data against schema
      const validatedData = productSchema.parse({
        ...productData,
        price: Number(productData.price),
        images: productData.images.map((file) => URL.createObjectURL(file)),
      });

      const formData = new FormData();
      formData.append("name", validatedData.name);
      formData.append("description", validatedData.description);
      formData.append("price", validatedData.price.toString());
      formData.append("stock", validatedData.stock.toString());
      formData.append("category", validatedData.category);
      formData.append("brand", validatedData.brand);
      formData.append("madeIn", validatedData.madeIn);
      productData.images.forEach((image) => {
        formData.append("images", image);
      });
      formData.append(
        "specifications",
        JSON.stringify(validatedData.specifications)
      );

      const headers = await axiosHeaders();
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
        formData,
        {
          ...headers,
          headers: {
            ...headers.headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Product created successfully!");
      router.push("/products");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to create product. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Create New Product</h1>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                required
                placeholder="Enter product name"
                value={productData.name}
                onChange={(e) =>
                  setProductData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                required
                placeholder="Enter brand name"
                value={productData.brand}
                onChange={(e) =>
                  setProductData((prev) => ({ ...prev, brand: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (KES) *</Label>
              <Input
                id="price"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                value={productData.price}
                onChange={(e) =>
                  setProductData((prev) => ({ ...prev, price: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                required
                min="0"
                step="1"
                placeholder="0"
                value={productData.stock}
                onChange={(e) =>
                  setProductData((prev) => ({
                    ...prev,
                    stock: parseInt(e.target.value),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                value={productData.category}
                onChange={(e) =>
                  setProductData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              >
                <option value="">Select a category</option>
                <option value="general">General</option>
                <option value="wheels">Wheels</option>
                <option value="tyres">Tyres</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="madeIn">Made In *</Label>
              <Input
                id="madeIn"
                required
                placeholder="Country of origin"
                value={productData.madeIn}
                onChange={(e) =>
                  setProductData((prev) => ({
                    ...prev,
                    madeIn: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              placeholder="Enter product description"
              className="min-h-[100px]"
              value={productData.description}
              onChange={(e) =>
                setProductData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Product Images *</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              required
              className="cursor-pointer"
            />
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {imagePreview.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

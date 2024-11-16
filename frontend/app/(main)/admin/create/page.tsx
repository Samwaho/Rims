"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductForm } from "@/components/forms/ProductForm";
import { productSchema } from "@/lib/utils";
import { getAuthUser } from "@/lib/actions";
import { useUploadThing } from "@/lib/uploadthing";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import type { ProductFormValues } from "@/components/forms/ProductForm";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CreateProductPage() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: () => {
      toast.success("Images uploaded successfully!");
      return;
    },
    onUploadError: (error) => {
      toast.error(`Error uploading images: ${error.message}`);
      return;
    },
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "general",
      brand: "",
      madeIn: "",
      images: [],
      specifications: [],
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (
      data: Omit<ProductFormValues, "images"> & { images: string[] }
    ) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
        {
          productData: {
            name: data.name,
            description: data.description,
            price: Number(data.price),
            stock: Number(data.stock),
            category: data.category,
            brand: data.brand || "",
            madeIn: data.madeIn || "",
            specifications: data.specifications.filter(
              (spec) => spec.name.trim() && spec.value.trim()
            ),
          },
          imageUrls: data.images,
        },
        await axiosHeaders()
      );

      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Product created successfully!");
      router.push("/admin");
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getAuthUser();
        if (!user) {
          toast.error("Please sign in to access this page");
          router.push("/sign-in");
          return;
        }
        if (user.role !== "admin") {
          toast.error("Unauthorized access");
          router.push("/");
          return;
        }
      } catch (error) {
        toast.error("Authentication error occurred");
        router.push("/sign-in");
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 5MB size limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length) {
      form.setValue("images", validFiles);
      setImagePreview(validFiles.map((file) => URL.createObjectURL(file)));
      setIsDirty(true);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const currentImages = form.getValues("images");
    form.setValue(
      "images",
      currentImages.filter((_: File, index: number) => index !== indexToRemove)
    );
    setImagePreview((prev: string[]) =>
      prev.filter((_: string, index: number) => index !== indexToRemove)
    );
    setIsDirty(true);
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      console.log("Form submission started", data);
      let imageUrls: string[] = [];

      if (data.images?.length) {
        console.log("Starting image upload", data.images);
        const uploadedImages = await startUpload(Array.from(data.images));
        if (!uploadedImages) {
          throw new Error("Failed to upload images");
        }
        imageUrls = uploadedImages.map((img) => img.url);
        console.log("Images uploaded successfully:", imageUrls);
      }

      const productData = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
        category: data.category,
        brand: data.brand || "",
        madeIn: data.madeIn || "",
        specifications: data.specifications.filter(
          (spec) => spec.name.trim() && spec.value.trim()
        ),
        images: imageUrls,
      };

      console.log("Creating product with data:", productData);
      await createProductMutation.mutateAsync(productData);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to create product");
    }
  };

  if (isAuthChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 sm:py-12">
      <ProductForm
        form={form}
        onSubmit={onSubmit}
        imagePreview={imagePreview}
        handleImageChange={handleImageChange}
        isSubmitting={createProductMutation.isPending}
        isUploading={isUploading}
        title="Create New Product"
        description="Fill in the details to create a new product listing"
        submitLabel="Create Product"
        onBack={() => router.back()}
        removeImage={removeImage}
        setIsDirty={setIsDirty}
      />
    </div>
  );
}

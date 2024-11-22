"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductForm } from "@/components/forms/ProductForm";
import { productSchema } from "@/lib/utils";
import { getAuthUser } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import type { ProductFormValues } from "@/components/forms/ProductForm";
import { UploadClient } from "@uploadcare/upload-client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const uploadClient = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "",
});

export default function CreateProductPage() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "general",
      size: "",
      madeIn: "",
      images: [],
      specifications: [],
      buyingPrice: 0,
      shippingCost: 0,
      deliveryTime: "",
      productType: "oem",
      condition: undefined,
    },
  });

  const queryClient = useQueryClient();

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
            size: data.size || "",
            madeIn: data.madeIn || "",
            specifications: data.specifications.filter(
              (spec) => spec.name.trim() && spec.value.trim()
            ),
            buyingPrice: Number(data.buyingPrice),
            shippingCost: Number(data.shippingCost),
            deliveryTime: data.deliveryTime,
            productType: data.productType,
            condition: data.condition,
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
      queryClient.invalidateQueries({ queryKey: ["products"] });
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

  const uploadImages = async (files: File[]) => {
    try {
      const uploadPromises = files.map((file) => uploadClient.uploadFile(file));

      const results = await Promise.all(uploadPromises);
      return results.map((result) => `https://ucarecdn.com/${result.uuid}/`);
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Failed to upload images");
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      let imageUrls: string[] = [];

      if (data.images?.length) {
        setIsUploading(true);
        try {
          const filesToUpload = Array.from(data.images) as File[];
          imageUrls = await uploadImages(filesToUpload);
          toast.success("Images uploaded successfully!");
        } catch (error) {
          toast.error("Failed to upload images");
          throw error;
        } finally {
          setIsUploading(false);
        }
      }

      const productData = {
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
        images: imageUrls,
        specifications: data.specifications.filter(
          (spec) => spec.name.trim() && spec.value.trim()
        ),
      };

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
    <div className="container max-w-4xl mx-auto py-6 px-4 sm:py-10">
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

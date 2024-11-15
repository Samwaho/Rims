"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductForm } from "@/components/forms/ProductForm";
import { productSchema } from "@/lib/utils";
import { getAuthUser } from "@/lib/actions";
import { useUploadThing } from "@/lib/uploadthing";
import type { ProductFormValues } from "@/components/forms/ProductForm";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface Specification {
  name: string;
  value: string;
}

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const queryClient = useQueryClient();

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: () => {
      toast.success("Images uploaded successfully!");
      return;
    },
    onUploadError: (error) => {
      toast.error("Error uploading images");
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
      category: "general" as const,
      brand: "",
      madeIn: "",
      images: [],
      specifications: [],
    },
  });

  // Auth check
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

  // Product fetch
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", params.id],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${params.id}`
      );
      return response.data;
    },
  });

  // Form initialization
  useEffect(() => {
    if (!product) return;

    // Create dummy File objects for existing images
    const dummyFiles = product.images.map(
      (url: string) => new File([], url, { type: "image/jpeg" })
    );

    form.reset({
      ...product,
      images: dummyFiles, // Set the images field with dummy files
      specifications: product.specifications || [],
    });
    setExistingImages(product.images || []);
    setImagePreview(product.images || []);
    setIsDirty(false);
  }, [product, form]);

  // Navigation protection
  const handleNavigation = useCallback(
    () =>
      !isDirty ||
      window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      ),
    [isDirty]
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      try {
        // Ensure specifications are valid
        const validSpecifications = (data.specifications || []).filter(
          (spec) => spec && spec.name?.trim() && spec.value?.trim()
        );

        const productData = {
          name: data.name,
          description: data.description,
          price: Number(data.price),
          stock: Number(data.stock),
          category: data.category,
          brand: data.brand,
          madeIn: data.madeIn,
          specifications: validSpecifications,
        };

        // Use existingImages instead of form's images field
        let finalImageUrls = [...existingImages];

        if (newImages.length > 0) {
          const uploadedImages = await startUpload(newImages);
          if (!uploadedImages) throw new Error("Failed to upload new images");
          finalImageUrls = [
            ...finalImageUrls,
            ...uploadedImages.map((image) => image.url),
          ];
        }

        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${params.id}`,
          {
            productData,
            imageUrls: finalImageUrls,
          },
          await axiosHeaders()
        );
        return response.data;
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", params.id] });
      toast.success("Product updated successfully!");
      setIsDirty(false);
      router.push("/admin");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update product. Please try again."
      );
    },
  });

  const onSubmit = async (formData: ProductFormValues) => {
    try {
      await updateProductMutation.mutateAsync(formData);
    } catch (error) {
      // Error handled by mutation error callback
    }
  };

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

    if (!validFiles.length) return;

    setNewImages((prev) => [...prev, ...validFiles]);
    setImagePreview((prev) => [
      ...prev,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ]);
    setIsDirty(true);
  };

  const removeImage = (indexToRemove: number) => {
    if (indexToRemove < existingImages.length) {
      setExistingImages((prev) =>
        prev.filter((_, index) => index !== indexToRemove)
      );
    } else {
      const newImageIndex = indexToRemove - existingImages.length;
      setNewImages((prev) =>
        prev.filter((_, index) => index !== newImageIndex)
      );
    }
    setImagePreview((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setIsDirty(true);
  };

  if (isAuthChecking || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-primary mb-4">
          Error Loading Product
        </h2>
        <p className="text-gray-600 mb-4">Please try again later</p>
        <Button onClick={() => router.push("/admin")}>
          Return to Admin Panel
        </Button>
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
        isSubmitting={updateProductMutation.isPending}
        isUploading={isUploading}
        title="Edit Product"
        description="Update the product details below"
        submitLabel="Update Product"
        onBack={() => handleNavigation() && router.back()}
        removeImage={removeImage}
        setIsDirty={setIsDirty}
        existingImages={existingImages}
      />
    </div>
  );
}

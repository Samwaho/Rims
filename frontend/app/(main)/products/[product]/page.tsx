"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { axiosHeaders, getAuthUser } from "@/lib/actions";
import { Product } from "@/types/product";
import ProductImages from "@/components/product/ProductImages";
import ProductDetails from "@/components/product/ProductDetails";
import ProductReviews from "@/components/product/ProductReviews";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STALE_TIME = 1000 * 60 * 5; // 5 minutes

const fetchProduct = async (id: string): Promise<Product> => {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/api/products/${id}`);
    return {
      ...data,
      reviews: data.reviews?.map((review: any) => ({
        ...review,
        _id: review._id || review.id,
        createdAt: new Date(review.createdAt).toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export default function ProductPage({
  params: { product: productId },
}: {
  params: { product: string };
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: any | null;
  }>({
    isAuthenticated: false,
    user: null,
  });

  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getAuthUser();
        setAuthState({
          isAuthenticated: Boolean(user),
          user,
        });
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthState({
          isAuthenticated: false,
          user: null,
        });
      }
    };

    checkAuth();
  }, []);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
    retry: 2,
    staleTime: STALE_TIME,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const headers = await axiosHeaders();
      await axios.post(
        `${BACKEND_URL}/api/cart`,
        { productId, quantity },
        headers
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Product added to cart");
    },
    onError: () => {
      toast.error("Failed to add product to cart. Please try again.");
    },
  });

  const handleAddToCart = useCallback(() => {
    if (!authState.isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    if (!product) {
      toast.error("Product information not available");
      return;
    }

    if (!navigator.onLine) {
      toast.error("No internet connection. Please check your network");
      return;
    }

    addToCartMutation.mutate({ productId: product._id, quantity: 1 });
  }, [authState.isAuthenticated, product, router, addToCartMutation]);

  if (isLoading) return <ProductSkeleton />;

  if (error || !product) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading product. Please try again later.
      </div>
    );
  }

  const { isAuthenticated, user } = authState;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <ProductImages
          product={product}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          isAuthenticated={isAuthenticated}
          user={user}
        />
        <div>
          <ProductDetails product={product} handleAddToCart={handleAddToCart} />
        </div>
      </div>
      <Separator className="my-8" />
      <div className="lg:hidden">
        <ProductReviews
          product={product}
          isAuthenticated={isAuthenticated}
          user={user}
        />
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
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

const fetchProduct = async (id: string): Promise<Product> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`
    );
    const product = response.data;
    if (product.reviews) {
      product.reviews = product.reviews.map((review: any) => ({
        ...review,
        _id: review._id || review.id,
        createdAt: new Date(review.createdAt).toISOString(),
      }));
    }
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export default function ProductPage({
  params,
}: {
  params: { product: string };
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getAuthUser();
        setIsAuthenticated(response !== null);
        if (response) {
          setUser(response);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product>({
    queryKey: ["product", params.product],
    queryFn: () => fetchProduct(params.product),
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`,
        { productId, quantity },
        await axiosHeaders()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Product added to cart");
    },
    onError: (error) => {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add product to cart. Please try again.");
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
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
  };

  if (isLoading) return <ProductSkeleton />;
  if (error || !product)
    return (
      <div className="text-center py-8 text-red-600">
        Error loading product. Please try again later.
      </div>
    );

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

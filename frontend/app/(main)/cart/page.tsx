"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { axiosHeaders } from "@/lib/actions";
import { toast } from "sonner";
import { Trash2, Minus, Plus, ShoppingBag, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
}

const fetchCart = async (): Promise<CartItem[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`,
      await axiosHeaders()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Please sign in to view your cart");
    }
    throw new Error("Failed to fetch cart items. Please try again later.");
  }
};

export const dynamic = "force-dynamic";

const CartPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: cartItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: fetchCart,
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error.message === "Please sign in to view your cart") return false;
      return failureCount < 3;
    },
    retryDelay: 1000,
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${itemId}`,
          { quantity },
          await axiosHeaders()
        );
      } catch (error: any) {
        if (error.response?.status === 400) {
          throw new Error("Invalid quantity specified");
        }
        throw new Error("Failed to update cart");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${itemId}`,
          await axiosHeaders()
        );
      } catch (error) {
        throw new Error("Failed to remove item from cart");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed from cart");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const initialQuantities = cartItems.reduce((acc, item) => {
      acc[item._id] = item.quantity;
      return acc;
    }, {} as Record<string, number>);
    setQuantities(initialQuantities);
  }, [cartItems]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      toast.error("Quantity cannot be less than 1");
      return;
    }
    if (newQuantity > 99) {
      toast.error("Maximum quantity allowed is 99");
      return;
    }
    setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
    updateCartMutation.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      removeItemMutation.mutate(itemId);
    }
  };

  const totalPrice = cartItems.reduce((total, item) => {
    return total + item.product.price * (quantities[item._id] || item.quantity);
  }, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex items-center space-x-6 bg-white p-6 rounded-lg shadow-sm"
            >
              <Skeleton className="h-24 w-24 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-5 w-1/3" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => refetch()}
            className="bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>
          <Button variant="outline" onClick={() => router.push("/products")}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <ShoppingBag className="mx-auto h-20 w-20 text-gray-400 mb-6" />
            <p className="text-2xl text-gray-600 mb-4">Your cart is empty</p>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-block bg-primary hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full transition duration-300"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-primary/20 transition duration-300"
                >
                  <Link
                    href={`/products/${item.product._id}`}
                    className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-md hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </Link>
                  <div className="flex-1 text-center sm:text-left">
                    <Link
                      href={`/products/${item.product._id}`}
                      className="font-semibold text-lg hover:text-primary transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-primary font-medium mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleQuantityChange(item._id, quantities[item._id] - 1)
                      }
                      className="w-8 h-8 rounded-full p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      value={quantities[item._id] || item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item._id, parseInt(e.target.value))
                      }
                      className="w-14 text-center"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleQuantityChange(item._id, quantities[item._id] + 1)
                      }
                      className="w-8 h-8 rounded-full p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full ml-2"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full bg-primary hover:opacity-90 text-white text-lg py-6 rounded-full transition duration-300"
                  onClick={() => router.push("/checkout")}
                >
                  Proceed to Checkout
                </Button>
                <Link
                  href="/products"
                  className="mt-4 text-center block text-primary hover:opacity-80 font-medium transition duration-300"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default CartPage;

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
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

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
  const response = await axios.get(
    "http://localhost:3001/api/cart",
    await axiosHeaders()
  );
  return response.data;
};

const CartPage = () => {
  const queryClient = useQueryClient();
  const {
    data: cartItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: fetchCart,
    retry: 3,
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
      await axios.put(
        `http://localhost:3001/api/cart/${itemId}`,
        { quantity },
        await axiosHeaders()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart updated successfully");
    },
    onError: () => {
      toast.error("Failed to update cart");
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await axios.delete(
        `http://localhost:3001/api/cart/${itemId}`,
        await axiosHeaders()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed from cart");
    },
    onError: () => {
      toast.error("Failed to remove item from cart");
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
    if (newQuantity < 1) return;
    setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
    updateCartMutation.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const totalPrice = cartItems.reduce((total, item) => {
    return total + item.product.price * (quantities[item._id] || item.quantity);
  }, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex items-center space-x-6 bg-white p-6 rounded-lg shadow-md"
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Error loading cart</h1>
        <p className="text-red-500 mb-4">
          An error occurred while loading your cart.
        </p>
        <Button
          onClick={() => refetch()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <ShoppingBag className="mx-auto h-20 w-20 text-gray-400 mb-6" />
          <p className="text-2xl text-gray-600 mb-6">Your cart is empty.</p>
          <Link
            href="/products"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition duration-300"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
              >
                <div className="relative w-32 h-32 flex-shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold text-xl mb-2">
                    {item.product.name}
                  </h3>
                  <p className="text-gray-600 text-lg font-medium">
                    {formatPrice(item.product.price)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleQuantityChange(item._id, quantities[item._id] - 1)
                    }
                    className="w-10 h-10 rounded-full"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantities[item._id] || item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item._id, parseInt(e.target.value))
                    }
                    className="w-16 text-center"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleQuantityChange(item._id, quantities[item._id] + 1)
                    }
                    className="w-10 h-10 rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleRemoveItem(item._id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full"
                >
                  <Trash2 className="h-6 w-6" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-gray-100 p-8 rounded-lg shadow-inner">
            <p className="text-2xl font-bold mb-6">
              Total:{" "}
              <span className="text-green-600">{formatPrice(totalPrice)}</span>
            </p>
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-4 rounded-full transition duration-300"
              onClick={() => (window.location.href = "/checkout")}
            >
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
      <Link
        href="/products"
        className="mt-10 inline-block text-blue-600 hover:text-blue-800 hover:underline transition duration-300"
      >
        ← Continue Shopping
      </Link>
    </div>
  );
};

export default CartPage;

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
              className="flex items-center space-x-6 bg-white p-4 rounded-lg shadow"
            >
              <Skeleton className="h-24 w-24 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-10 w-24" />
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
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-lg text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center space-x-6 bg-white p-4 rounded-lg shadow"
              >
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={96}
                  height={96}
                  className="rounded-md object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.product.name}</h3>
                  <p className="text-gray-600">
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
                    className="w-8 h-8"
                  >
                    -
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
                    className="w-8 h-8"
                  >
                    +
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveItem(item._id)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-gray-100 p-6 rounded-lg">
            <p className="text-2xl font-semibold mb-4">
              Total: {formatPrice(totalPrice)}
            </p>
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-3">
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
      <Link
        href="/products"
        className="mt-8 inline-block text-blue-600 hover:text-blue-800 hover:underline"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default CartPage;

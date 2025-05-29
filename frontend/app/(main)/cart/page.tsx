"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
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
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    shippingCost: number;
  };
  quantity: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const fetchCart = async (): Promise<CartItem[]> => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/cart`,
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

const CartSkeleton = memo(() => (
  <div className="space-y-6 animate-pulse">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="flex items-center space-x-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100"
      >
        <Skeleton className="h-32 w-32 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
        </div>
        <Skeleton className="h-12 w-36" />
      </div>
    ))}
  </div>
));

CartSkeleton.displayName = "CartSkeleton";

const EmptyCart = memo(() => (
  <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
    <ShoppingBag className="mx-auto h-24 w-24 text-primary/40 mb-8 animate-bounce" />
    <h2 className="text-3xl font-bold text-gray-800 mb-4">
      Your cart is empty
    </h2>
    <p className="text-gray-600 text-lg mb-10">
      Looks like you haven't added any items to your cart yet.
    </p>
    <Link
      href="/products"
      className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      Start Shopping
    </Link>
  </div>
));

EmptyCart.displayName = "EmptyCart";

const CartItem = memo(
  ({
    item,
    quantity,
    onQuantityChange,
    onRemove,
    isUpdating,
  }: {
    item: CartItem;
    quantity: number;
    onQuantityChange: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
    isUpdating: boolean;
  }) => (
    <div
      className={`flex flex-col sm:flex-row items-center gap-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-300 ${
        isUpdating ? "opacity-70" : ""
      }`}
    >
      <Link
        href={`/products/${item.product._id}`}
        className="relative w-36 h-36 flex-shrink-0 overflow-hidden rounded-lg group"
      >
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          layout="fill"
          objectFit="cover"
          className="rounded-lg group-hover:scale-110 transition-transform duration-500"
        />
      </Link>
      <div className="flex-1 text-center sm:text-left space-y-2">
        <Link
          href={`/products/${item.product._id}`}
          className="font-bold text-xl hover:text-primary transition-colors duration-300"
        >
          {item.product.name}
        </Link>
        <div>
          <p className="text-primary text-lg font-semibold">
            {formatPrice(item.product.price)}
          </p>
          <p className="text-sm text-gray-500 font-medium">
            Price for 4 pieces
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onQuantityChange(item._id, quantity - 1)}
          className="w-10 h-10 rounded-full p-0 hover:bg-primary/10 hover:text-primary transition-colors duration-300"
          disabled={isUpdating || quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          min="1"
          max="99"
          value={quantity}
          onChange={(e) => onQuantityChange(item._id, parseInt(e.target.value))}
          className="w-16 text-center text-lg font-medium"
          disabled={isUpdating}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => onQuantityChange(item._id, quantity + 1)}
          className="w-10 h-10 rounded-full p-0 hover:bg-primary/10 hover:text-primary transition-colors duration-300"
          disabled={isUpdating || quantity >= 99}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => onRemove(item._id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-full ml-2 transition-colors duration-300"
          disabled={isUpdating}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
);

CartItem.displayName = "CartItem";

const OrderSummary = memo(
  ({
    totalPrice,
    shippingCost,
    onCheckout,
    isLoading,
  }: {
    totalPrice: number;
    shippingCost: number;
    onCheckout: () => void;
    isLoading: boolean;
  }) => (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 sticky top-4">
      <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-gray-700 text-lg">
          <span>Subtotal</span>
          <div className="text-right">
            <div className="font-medium">{formatPrice(totalPrice)}</div>
            <div className="text-sm text-gray-500">
              All prices are for 4 pieces per item
            </div>
          </div>
        </div>
        <div className="flex justify-between text-gray-700 text-lg">
          <span>Shipping</span>
          <span className="font-medium">{formatPrice(shippingCost)}</span>
        </div>
        <div className="border-t pt-4 flex justify-between font-bold text-xl">
          <span>Total</span>
          <span className="text-primary">{formatPrice(totalPrice)}</span>
        </div>
      </div>
      <Button
        className="w-full bg-primary hover:bg-primary/90 text-white text-lg py-7 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        onClick={onCheckout}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
        Proceed to Checkout
      </Button>
      <Link
        href="/products"
        className="mt-6 text-center block text-primary hover:text-primary/80 font-semibold transition-colors duration-300"
      >
        Continue Shopping
      </Link>
    </div>
  )
);

OrderSummary.displayName = "OrderSummary";

const CartPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const {
    data: cartItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: fetchCart,
    retry: (failureCount, error: any) => {
      return (
        error.message !== "Please sign in to view your cart" && failureCount < 3
      );
    },
    retryDelay: 1000,
  });

  const updateCartMutation = useMutation<
    any,
    Error,
    { itemId: string; quantity: number }
  >({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      const response = await axios.put(
        `${BACKEND_URL}/api/cart/${itemId}`,
        { quantity },
        await axiosHeaders()
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart updated successfully");
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(variables.itemId);
        return next;
      });
    },
    onError: (error: Error, variables) => {
      toast.error(error.message);
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(variables.itemId);
        return next;
      });
    },
  });

  const removeItemMutation = useMutation<void, Error, string>({
    mutationFn: async (itemId: string) => {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      await axios.delete(
        `${BACKEND_URL}/api/cart/${itemId}`,
        await axiosHeaders()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed from cart");
      setShowRemoveDialog(false);
      setItemToRemove(null);
    },
    onError: () => {
      toast.error("Failed to remove item from cart");
      setShowRemoveDialog(false);
      setItemToRemove(null);
    },
    onSettled: (_, __, itemId) => {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    },
  });

  useEffect(() => {
    const initialQuantities = cartItems.reduce(
      (acc, item) => ({
        ...acc,
        [item._id]: item.quantity,
      }),
      {}
    );
    setQuantities(initialQuantities);
  }, [cartItems]);

  const handleQuantityChange = useCallback(
    (itemId: string, newQuantity: number) => {
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
    },
    [updateCartMutation]
  );

  const handleRemoveItem = useCallback((itemId: string) => {
    setItemToRemove(itemId);
    setShowRemoveDialog(true);
  }, []);

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + item.product.price * (quantities[item._id] || item.quantity),
    0
  );

  const shippingCost = cartItems.reduce(
    (total, item) =>
      total + (item.product.shippingCost || 0) * (quantities[item._id] || item.quantity),
    0
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
        <CartSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-lg">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center gap-6">
          <Button
            onClick={() => refetch()}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/products")}
            className="text-lg px-8 py-6"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-6 py-12 flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <h1 className="text-4xl font-bold mb-10">Your Cart</h1>
        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  quantity={quantities[item._id] || item.quantity}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                  isUpdating={updatingItems.has(item._id)}
                />
              ))}
            </div>
            <div className="lg:col-span-1">
              <OrderSummary
                totalPrice={totalPrice}
                shippingCost={shippingCost}
                onCheckout={() => router.push("/checkout")}
                isLoading={
                  updateCartMutation.isPending || removeItemMutation.isPending
                }
              />
            </div>
          </div>
        )}

        <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this item from your cart?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  itemToRemove && removeItemMutation.mutate(itemToRemove)
                }
                className="bg-red-500 hover:bg-red-600"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Suspense>
  );
};

export default CartPage;

"use client";

import React from "react";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";

const queryClient = new QueryClient();

interface CartCountResponse {
  count: number;
}

const fetchCartCount = async (): Promise<number> => {
  try {
    const response = await axios.get<CartCountResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/count`,
      await axiosHeaders()
    );
    return response.data.count;
  } catch (error) {
    console.error("Failed to fetch cart count:", error);
    return 0;
  }
};

const CartCountInner = () => {
  const {
    data: count = 0,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["cartCount"],
    queryFn: fetchCartCount,
    refetchInterval: 5000,
    staleTime: 30000,
    gcTime: 1000 * 60 * 5,
    retry: 2,
  });

  if (isError) {
    console.error("Error fetching cart count:", error);
    return null;
  }

  if (isLoading) return null;
  if (count === 0) return null;

  return (
    <span
      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
      aria-label={`${count} items in cart`}
      role="status"
    >
      {count}
    </span>
  );
};

const CartCount = () => {
  return <CartCountInner />;
};

export default CartCount;

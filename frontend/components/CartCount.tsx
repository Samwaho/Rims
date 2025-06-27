"use client";

import React, { memo } from "react";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";

// Create QueryClient instance outside component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // Data considered fresh for 30 seconds
      gcTime: 3600000, // Cache persists for 1 hour
      retry: 2, // Retry failed requests twice
    },
  },
});

// Memoize API call function
const fetchCartCount = async (): Promise<number> => {
  try {
    const headers = await axiosHeaders();
    const { data } = await axios.get<{ count: number }>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/count`,
      headers
    );
    return data.count;
  } catch (error) {
    console.error("Failed to fetch cart count:", error);
    return 0;
  }
};

// Memoize inner component to prevent unnecessary re-renders
const CartCountInner = memo(() => {
  const { data: count = 0 } = useQuery({
    queryKey: ["cartCount"],
    queryFn: fetchCartCount,
    refetchInterval: 5000,
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: true,
  });

  if (count === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg border-2 border-white transition-all duration-300 hover:scale-110">
      {count > 99 ? "99+" : count}
    </span>
  );
});

CartCountInner.displayName = "CartCountInner";

const CartCount = () => (
  <QueryClientProvider client={queryClient}>
    <CartCountInner />
  </QueryClientProvider>
);

export default CartCount;

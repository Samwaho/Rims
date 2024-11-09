import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";

// Define response type
interface CartCountResponse {
  count: number;
}

// Constants
const CART_COUNT_QUERY_KEY = ["cartCount"] as const;
const STALE_TIME = 30_000; // 30 seconds
const GC_TIME = 300_000; // 5 minutes
const MAX_RETRIES = 2;

// Create memoized fetch function
const fetchCartCount = async (): Promise<number> => {
  try {
    const headers = await axiosHeaders();
    const { data } = await axios.get<CartCountResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/count`,
      headers
    );
    return data.count;
  } catch (error) {
    console.error("Failed to fetch cart count:", error);
    return 0;
  }
};

export function useCartCount() {
  return useQuery({
    queryKey: CART_COUNT_QUERY_KEY,
    queryFn: fetchCartCount,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: MAX_RETRIES,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: true, // Always fetch fresh data on mount
  });
}

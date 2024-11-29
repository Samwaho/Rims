import { useQuery, Query } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { axiosHeaders } from "@/lib/actions";

// Define response type
interface CartCountResponse {
  count: number;
}

// Constants
const CART_COUNT_QUERY_KEY = ["cartCount"] as const;
const STALE_TIME = 120_000; // 2 minutes - increased to reduce API calls
const GC_TIME = 5 * 60_000; // 5 minutes
const MAX_RETRIES = 2; // Reduced retries

// Create memoized fetch function
const fetchCartCount = async (): Promise<number> => {
  try {
    const headers = await axiosHeaders();
    const { data } = await axios.get<CartCountResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/count`,
      {
        ...headers,
        // Add cache-control headers
        headers: {
          ...headers.headers,
          "Cache-Control": "public, max-age=120", // 2 minutes
        },
      }
    );
    return data.count;
  } catch (error) {
    // More specific error handling
    if (error instanceof AxiosError) {
      // Only log critical errors
      if (!error.isAxiosError || error.response?.status !== 304) {
        console.error(`Cart count error: ${error.message}`);
      }
      if (error.isAxiosError && !error.response) {
        return -1; // Special value to indicate network error
      }
    }
    return 0; // Default fallback for other errors
  }
};

export function useCartCount() {
  return useQuery({
    queryKey: CART_COUNT_QUERY_KEY,
    queryFn: fetchCartCount,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: MAX_RETRIES,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Optimize refetch with proper typing
    refetchInterval: (
      query: Query<number, Error, number, typeof CART_COUNT_QUERY_KEY>
    ) => {
      const data = query.state.data;
      if (data === undefined || data === 0) {
        return 5000; // Poll every 5 seconds in error state
      }
      return false; // Don't poll if we have valid data
    },
    select: (data) => (data === -1 ? 0 : data), // Convert network errors to 0
    // Add retry delay
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

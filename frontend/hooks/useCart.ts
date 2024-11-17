import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import { toast } from "sonner";

// Define types
interface CartItem {
  productId: string;
  quantity: number;
}

interface CartResponse {
  success: boolean;
  data: any;
}

// Constants
const CART_QUERY_KEY = ["cart"] as const;
const API_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`;

// Create memoized cart mutation hook
export const useCart = () => {
  const queryClient = useQueryClient();

  return useMutation<CartResponse, Error, CartItem>({
    mutationFn: async ({ productId, quantity }: CartItem) => {
      const headers = await axiosHeaders();
      const response = await axios.post<CartResponse>(
        API_ENDPOINT,
        { productId, quantity },
        headers
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Product added to cart", {
        duration: 2000,
        position: "bottom-right",
      });
    },
    onError: (error: Error) => {
      console.error("[Cart Error]:", error.message);
      toast.error("Failed to add product to cart. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      });
    },
    retry: 2, // Retry failed mutations twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";

interface CartCountResponse {
  count: number;
}

export function useCartCount() {
  return useQuery({
    queryKey: ["cartCount"],
    queryFn: async () => {
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
    },
    staleTime: 30000,
    gcTime: 1000 * 60 * 5,
    retry: 2,
  });
}

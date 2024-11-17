import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { User } from "./useUser";

export function useCart() {
  const queryClient = useQueryClient();

  const removeFromCart = useMutation({
    mutationFn: async (productId: string) => {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${productId}`,
        { withCredentials: true }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], (oldData: User | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, cart: data };
      });
    },
  });

  return {
    removeFromCart,
    isLoading: removeFromCart.isPending,
  };
}

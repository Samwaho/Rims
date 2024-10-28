import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import { toast } from "sonner";

export const useCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`,
        { productId, quantity },
        await axiosHeaders()
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartCount"] });
      toast.success("Added to cart successfully", {
        duration: 2000,
      });
    },
    onError: (error) => {
      toast.error("Failed to add to cart. Please try again.", {
        duration: 3000,
      });
      console.error("Cart error:", error);
    },
  });
};

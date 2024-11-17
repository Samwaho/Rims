import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import { toast } from "sonner";

interface Address {
  street?: string;
  city?: string;
  county?: string;
  postalCode?: string;
}

interface PaymentMethod {
  type: string;
  cardNumber: string;
  expiryDate: string;
  cardHolderName: string;
}

interface Preferences {
  newsletter: boolean;
  language: string;
}

interface CartItem {
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
}

interface Review {
  product: {
    _id: string;
    name: string;
  };
  review: string;
  createdAt: string;
}

interface Order {
  _id: string;
  status: string;
  createdAt: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: Address;
  role: "admin" | "user";
  isVerified: boolean;
  orders: Order[];
  wishlist: Array<{ _id: string; name: string }>;
  cart: CartItem[];
  reviews: Review[];
  paymentMethods: PaymentMethod[];
  preferences: Preferences;
}

export function useUser() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const headers = await axiosHeaders();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`,
          headers
        );
        return response.data.data;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error("Please sign in to continue");
          }
          if (error.response?.status === 404) {
            throw new Error("User profile not found");
          }
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const updateProfile = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const headers = await axiosHeaders();
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`,
        userData,
        headers
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const updateAddress = useMutation({
    mutationFn: async (addressData: Address) => {
      const headers = await axiosHeaders();
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/address`,
        addressData,
        headers
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], (oldData: User | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, address: data };
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Address updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update address");
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      const headers = await axiosHeaders();
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist/${productId}`,
        headers
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], (oldData: User | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, wishlist: data };
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Item removed from wishlist");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to remove from wishlist"
      );
    },
  });

  const updatePaymentMethods = useMutation({
    mutationFn: async (paymentMethods: PaymentMethod[]) => {
      const headers = await axiosHeaders();
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/payment-methods`,
        { paymentMethods },
        headers
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], (oldData: User | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, paymentMethods: data };
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Payment methods updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update payment methods"
      );
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (preferences: Partial<Preferences>) => {
      const headers = await axiosHeaders();
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/preferences`,
        preferences,
        headers
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], (oldData: User | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, preferences: data };
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Preferences updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update preferences"
      );
    },
  });

  return {
    user,
    isLoading,
    error,
    updateProfile,
    updateAddress,
    removeFromWishlist,
    updatePaymentMethods,
    updatePreferences,
  };
}

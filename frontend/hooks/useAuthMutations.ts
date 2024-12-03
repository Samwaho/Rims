import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { axiosHeaders } from "@/lib/actions";

export const useAuthMutations = () => {
  const { mutate: sendResetLink, isPending: isResetting } = useMutation({
    mutationFn: async (email: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`,
        { email },
        await axiosHeaders()
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        "If an account exists with this email, you will receive reset instructions",
        {
          duration: 5000,
          position: "top-center",
        }
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Unable to process request. Please try again.";
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });
    },
  });

  const { mutate: resendVerification, isPending: isResending } = useMutation({
    mutationFn: async (email: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/resend-verification`,
        { email },
        await axiosHeaders()
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Verification email sent! Please check your inbox.", {
        duration: 5000,
        position: "top-center",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send verification email. Please try again.";
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });
    },
  });

  const handleEmailAction = (
    email: string | undefined,
    action: (email: string) => void
  ) => {
    if (!email) {
      toast.error("Please enter your email address first", {
        duration: 4000,
        position: "top-center",
      });
      return;
    }
    action(email);
  };

  return {
    sendResetLink,
    isResetting,
    resendVerification,
    isResending,
    handleEmailAction,
  };
};

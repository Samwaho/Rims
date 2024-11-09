"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lock } from "lucide-react";

// Password validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const INITIAL_VALUES: ResetPasswordValues = {
  password: "",
  confirmPassword: "",
};

export default function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: INITIAL_VALUES,
  });

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: async (data: ResetPasswordValues) => {
      if (!token) throw new Error("Reset token is missing");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reset-password/${token}`,
        { newPassword: data.password }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password reset successful! Please sign in.", {
        duration: 5000,
        position: "top-center",
      });
      router.push("/sign-in");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reset password. The link may have expired. Please try again.";
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });
      console.error("Reset password error:", error);
    },
  });

  const renderPasswordField = (
    name: "password" | "confirmPassword",
    label: string,
    placeholder: string
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700 font-medium">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
              <Input
                {...field}
                type="password"
                placeholder={placeholder}
                className="h-11 pl-10 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </FormControl>
          <FormMessage className="text-red-500" />
        </FormItem>
      )}
    />
  );

  const onSubmit = (data: ResetPasswordValues) => {
    resetPassword(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 mt-1">Enter your new password</p>
        </div>

        {renderPasswordField("password", "New Password", "Enter new password")}

        {renderPasswordField(
          "confirmPassword",
          "Confirm Password",
          "Confirm new password"
        )}

        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold"
          disabled={isPending}
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
              <span>Resetting...</span>
            </div>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </Form>
  );
}

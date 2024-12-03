"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthMutations } from "@/hooks/useAuthMutations";
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
import Link from "next/link";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const INITIAL_VALUES = { email: "" };

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { sendResetLink, isResetting, handleEmailAction } = useAuthMutations();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: INITIAL_VALUES,
  });

  const handleReset = useCallback(() => {
    setIsEmailSent(false);
    form.reset();
  }, [form]);

  const onSubmit = useCallback(
    (data: ForgotPasswordValues) => {
      handleEmailAction(data.email, (email) => {
        sendResetLink(email);
        setIsEmailSent(true);
      });
    },
    [sendResetLink, handleEmailAction]
  );

  if (isEmailSent) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent password reset instructions to your email address.
          </p>
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={handleReset}
              className="text-primary hover:underline focus:outline-none"
            >
              try again
            </button>
          </p>
          <Link
            href="/sign-in"
            className="block mt-6 text-primary hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
          <p className="text-gray-600 mt-1">
            Enter your email to reset your password
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    className="h-11 pl-10 focus:ring-2 focus:ring-primary/20"
                    autoComplete="email"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold"
            disabled={isResetting}
          >
            {isResetting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              "Send Reset Instructions"
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/sign-in"
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-2 py-1"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}

"use client";

import { useState } from "react";
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
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { axiosHeaders, setCookies } from "@/lib/actions";
import { signInSchema } from "@/lib/utils";
import { Mail, Lock } from "lucide-react";

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const signInMutation = useMutation({
    mutationFn: async (data: SignInFormValues) =>
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signin`,
        data,
        await axiosHeaders()
      ),
    onSuccess: async (response) => {
      await setCookies(response.data.accessToken);
      toast.success("Welcome back!", {
        duration: 3000,
        position: "top-center",
      });
      router.push("/");
    },
    onError: (error) => {
      toast.error("Invalid email or password. Please try again.", {
        duration: 4000,
        position: "top-center",
      });
      form.setError("password", { message: "Please check your credentials" });
      console.log("Sign-in failed:", error);
    },
  });

  const onSubmit = (data: SignInFormValues) => {
    signInMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-200 hover:shadow-xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-1">
            Please enter your details to sign in
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
                    className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    autoComplete="email"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                    className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    autoComplete="current-password"
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
            className="w-full h-12 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-300 bg-primary hover:bg-primary/90 text-white"
            disabled={signInMutation.isPending}
          >
            {signInMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="space-y-3 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-2 py-1 transition-all duration-200"
              >
                Sign up
              </Link>
            </p>
            <div className="border-t border-gray-200 pt-3">
              <Link
                href="/forgot-password"
                className="text-primary font-medium hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-3 py-2 transition-all duration-200 inline-block hover:bg-primary/5"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

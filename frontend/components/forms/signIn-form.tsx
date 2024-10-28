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
import { Eye, EyeOff } from "lucide-react";

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
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
      toast.success("Welcome back!");
      router.push("/");
    },
    onError: (error) => {
      toast.error("Invalid email or password. Please try again.");
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
        className="space-y-6 max-w-md mx-auto p-4 bg-white rounded-xl shadow-lg border border-gray-100"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  className="h-11 focus:ring-2 focus:ring-primary/20"
                />
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
              <FormLabel className="text-gray-700">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-11 pr-10 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200"
            disabled={signInMutation.isPending}
          >
            {signInMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>

          <p className="text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="text-primary font-medium hover:underline transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}

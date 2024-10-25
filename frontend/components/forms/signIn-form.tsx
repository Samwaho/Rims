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
        `${process.env.BACKEND_URL}/api/auth/signin`,
        data,
        await axiosHeaders()
      ),
    onSuccess: async (response) => {
      await setCookies(response.data.accessToken);
      toast.success("Sign-in successful");
      router.push("/");
    },
    onError: (error) => {
      toast.error("Sign-in failed");
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
        className="space-y-6 max-w-md mx-auto p-6 bg-card rounded-lg shadow-md"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={signInMutation.isPending}
        >
          {signInMutation.isPending ? "Signing in..." : "Sign In"}
        </Button>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </Form>
  );
}

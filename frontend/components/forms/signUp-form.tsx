"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/lib/utils";
import { axiosHeaders } from "@/lib/actions";
import { Mail, Lock, User, Phone, MapPin, Building, Home } from "lucide-react";

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      address: {
        street: "",
        city: "",
        county: "",
        postalCode: "",
      },
    },
  });

  const router = useRouter();

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpFormValues) =>
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`,
        data,
        await axiosHeaders()
      ),
    onSuccess: () => {
      toast.success("Sign-up successful! Redirecting to login...", {
        duration: 3000,
        position: "top-center",
      });
      router.push("/sign-in");
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          duration: 4000,
          position: "top-center",
        });
      } else {
        toast.error("Something went wrong. Please try again.", {
          duration: 4000,
          position: "top-center",
        });
      }
      console.log("Sign-up failed:", error);
    },
  });

  const onSubmit = (data: SignUpFormValues) => {
    signUpMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-200 hover:shadow-xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-1">
            Please fill in your details to sign up
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">
                  First Name
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      {...field}
                      placeholder="John"
                      className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">
                  Last Name
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      {...field}
                      placeholder="Doe"
                      className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
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
                    placeholder="john.doe@example.com"
                    className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    autoComplete="email"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      placeholder="Enter password"
                      className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      autoComplete="new-password"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirm password"
                      className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      autoComplete="new-password"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">
                Phone Number (Optional)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    {...field}
                    type="tel"
                    placeholder="+254 712 345678"
                    className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    autoComplete="tel"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <fieldset className="space-y-4 border border-gray-200 p-6 rounded-xl bg-gray-50/50">
          <legend className="text-lg font-semibold px-2 text-gray-700">
            Address (Optional)
          </legend>
          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">
                  Street
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      {...field}
                      placeholder="123 Main St"
                      className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 bg-white transition-all duration-200"
                      autoComplete="street-address"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    City
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        {...field}
                        placeholder="Nairobi"
                        className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 bg-white transition-all duration-200"
                        autoComplete="address-level2"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.county"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    County
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        {...field}
                        placeholder="Nairobi"
                        className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 bg-white transition-all duration-200"
                        autoComplete="address-level1"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address.postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">
                  Postal Code
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      {...field}
                      placeholder="00100"
                      className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 bg-white transition-all duration-200"
                      autoComplete="postal-code"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </fieldset>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-300 bg-primary hover:bg-primary/90 text-white"
          disabled={signUpMutation.isPending}
        >
          {signUpMutation.isPending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
              <span>Creating Account...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </Button>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-2 py-1 transition-all duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}

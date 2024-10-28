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
import { Eye, EyeOff } from "lucide-react";

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      toast.success("Sign-up successful! Redirecting to login...");
      router.push("/sign-in");
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
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
        className="space-y-6 max-w-2xl mx-auto py-4 px-4 bg-white rounded-xl shadow-lg border border-gray-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">First Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="John"
                    className="h-11 focus:ring-2 focus:ring-primary/20"
                  />
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
                <FormLabel className="text-gray-700">Last Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Doe"
                    className="h-11 focus:ring-2 focus:ring-primary/20"
                  />
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
              <FormLabel className="text-gray-700">Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="john.doe@example.com"
                  className="h-11 focus:ring-2 focus:ring-primary/20"
                />
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
                <FormLabel className="text-gray-700">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="h-11 focus:ring-2 focus:ring-primary/20 pr-10"
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      className="h-11 focus:ring-2 focus:ring-primary/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
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
              <FormLabel className="text-gray-700">
                Phone Number (Optional)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder="+44 1234 567890"
                  className="h-11 focus:ring-2 focus:ring-primary/20"
                />
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
                <FormLabel className="text-gray-700">Street</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="123 Main St"
                    className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                  />
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
                  <FormLabel className="text-gray-700">City</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="London"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                    />
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
                  <FormLabel className="text-gray-700">County</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Greater London"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                    />
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
                <FormLabel className="text-gray-700">Postal Code</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="SW1A 1AA"
                    className="h-11 focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </fieldset>

        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={signUpMutation.isPending}
        >
          {signUpMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary font-medium hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}

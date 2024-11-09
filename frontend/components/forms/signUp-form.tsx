"use client";

import { useCallback } from "react";
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
import { signUpSchema } from "@/lib/utils";
import { axiosHeaders } from "@/lib/actions";
import { Mail, Lock, User, Phone, MapPin, Building, Home } from "lucide-react";

type SignUpFormValues = z.infer<typeof signUpSchema>;

const INITIAL_VALUES: SignUpFormValues = {
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
};

export default function SignUpForm() {
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: INITIAL_VALUES,
  });

  const { mutate: signUp, isPending } = useMutation({
    mutationFn: async (data: SignUpFormValues) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`,
        data,
        await axiosHeaders()
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Sign-up successful! Redirecting to login...", {
        duration: 3000,
        position: "top-center",
      });
      router.push("/sign-in");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });
      console.error("Sign-up failed:", error);
    },
  });

  const onSubmit = useCallback(
    (data: SignUpFormValues) => {
      signUp(data);
    },
    [signUp]
  );

  const renderFormField = useCallback(
    ({
      name,
      label,
      type = "text",
      placeholder,
      icon: Icon,
      autoComplete,
    }: {
      name: any;
      label: string;
      type?: string;
      placeholder: string;
      icon: any;
      autoComplete?: string;
    }) => (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 font-medium">{label}</FormLabel>
            <FormControl>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  {...field}
                  type={type}
                  placeholder={placeholder}
                  className="h-11 pl-10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  autoComplete={autoComplete}
                />
              </div>
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />
    ),
    [form.control]
  );

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
          {renderFormField({
            name: "firstName",
            label: "First Name",
            placeholder: "John",
            icon: User,
          })}
          {renderFormField({
            name: "lastName",
            label: "Last Name",
            placeholder: "Doe",
            icon: User,
          })}
        </div>

        {renderFormField({
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "john.doe@example.com",
          icon: Mail,
          autoComplete: "email",
        })}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderFormField({
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "Enter password",
            icon: Lock,
            autoComplete: "new-password",
          })}
          {renderFormField({
            name: "confirmPassword",
            label: "Confirm Password",
            type: "password",
            placeholder: "Confirm password",
            icon: Lock,
            autoComplete: "new-password",
          })}
        </div>

        {renderFormField({
          name: "phoneNumber",
          label: "Phone Number (Optional)",
          type: "tel",
          placeholder: "+254 712 345678",
          icon: Phone,
          autoComplete: "tel",
        })}

        <fieldset className="space-y-4 border border-gray-200 p-6 rounded-xl bg-gray-50/50">
          <legend className="text-lg font-semibold px-2 text-gray-700">
            Address (Optional)
          </legend>

          {renderFormField({
            name: "address.street",
            label: "Street",
            placeholder: "123 Main St",
            icon: Home,
            autoComplete: "street-address",
          })}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderFormField({
              name: "address.city",
              label: "City",
              placeholder: "Nairobi",
              icon: Building,
              autoComplete: "address-level2",
            })}
            {renderFormField({
              name: "address.county",
              label: "County",
              placeholder: "Nairobi",
              icon: Building,
              autoComplete: "address-level1",
            })}
          </div>

          {renderFormField({
            name: "address.postalCode",
            label: "Postal Code",
            placeholder: "00100",
            icon: MapPin,
            autoComplete: "postal-code",
          })}
        </fieldset>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-300 bg-primary hover:bg-primary/90 text-white"
          disabled={isPending}
        >
          {isPending ? (
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

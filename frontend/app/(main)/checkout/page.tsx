"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Phone as PhoneIcon,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  MapPin,
  Clock,
  Mail,
  Info,
  Loader2,
  Building,
  Home,
  Truck,
  Globe,
  Shield,
  Lock,
  User,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getUserPaymentDetails } from "@/lib/actions";
import Image from "next/image";

// Types
interface Product {
  _id: string;
  name: string;
  price: number;
  shippingCost: number;
  deliveryTime: string;
  images: string[];
}

interface CheckoutItem {
  _id: string;
  product: Product;
  quantity: number;
}

interface ShippingRate {
  cost: number;
  name: string;
}

interface Discount {
  code: string;
  amount: number;
  type: "percentage" | "fixed";
  value: number;
}

interface DeliveryPoint {
  _id: string;
  name: string;
  location: string;
  description?: string;
  baseRate: number;
  freeShippingThreshold?: number;
  isActive: boolean;
  operatingHours?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

// Schemas
const mpesaNumberSchema = z.string().regex(/^\+254\d{9}$/, {
  message: "Please enter a valid Mpesa number starting with +254",
});

const bankDetailsSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountHolder: z.string().min(1, "Account holder name is required"),
});

const shippingSchema = z.object({
  shippingDetails: z.object({
    city: z.string().min(1, "City is required"),
    subCounty: z.string().min(1, "Sub County is required"),
    estateName: z.string().min(1, "Estate name is required"),
    roadName: z.string().min(1, "Road/Street name is required"),
    apartmentName: z.string().optional(),
    houseNumber: z.string().min(1, "House number is required"),
    contactNumber: z.string().regex(/^\+254\d{9}$/, {
      message: "Please enter a valid phone number starting with +254",
    }),
  }),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

// API Functions
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const fetchCart = async (): Promise<CheckoutItem[]> => {
  const response = await axios.get(
    `${BACKEND_URL}/api/cart`,
    await axiosHeaders()
  );
  return response.data;
};

const fetchProduct = async (productId: string): Promise<CheckoutItem> => {
  const response = await axios.get(
    `${BACKEND_URL}/api/products/${productId}`,
    await axiosHeaders()
  );
  return {
    _id: response.data._id,
    product: response.data,
    quantity: 1,
  };
};

const fetchShippingRate = async (
  deliveryPointId: string,
  subtotal: number
): Promise<number> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/shipping/rate`, {
      params: { deliveryPointId, subtotal },
      ...(await axiosHeaders()),
    });
    return response.data.cost;
  } catch (error) {
    console.error("Error fetching shipping rate:", error);
    return 0;
  }
};

const validateDiscount = async (
  code: string,
  subtotalAmount: number
): Promise<Discount> => {
  const response = await axios.post(
    `${BACKEND_URL}/api/discounts/validate`,
    {
      code,
      subtotal: subtotalAmount,
    },
    await axiosHeaders()
  );

  if (!response.data.discount) {
    throw new Error("Invalid discount");
  }

  return {
    code,
    amount: response.data.discount,
    type: response.data.type,
    value: response.data.value,
  };
};

const fetchDeliveryPoints = async (): Promise<DeliveryPoint[]> => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/shipping`,
      await axiosHeaders()
    );
    return response.data.deliveryPoints || [];
  } catch (error) {
    console.error("Error fetching delivery points:", error);
    return [];
  }
};

// Components
const OrderItem = React.memo(({ item }: { item: CheckoutItem }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/80 p-3 sm:p-5 rounded-xl hover:bg-gray-100/90 transition-all duration-300 border border-gray-100 gap-4 sm:gap-5">
    <div className="flex items-start sm:items-center gap-3 sm:gap-5 w-full sm:w-auto">
      <div className="w-16 h-16 sm:w-20 sm:h-20 relative rounded-lg overflow-hidden shadow-sm flex-shrink-0">
        <img
          src={item.product.images[0]}
          alt={item.product.name}
          className="object-cover w-full h-full transform hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="space-y-1 flex-1">
        <p className="font-semibold text-gray-900 tracking-tight text-sm sm:text-base break-words">
          {item.product.name}
        </p>
        <div className="space-y-0.5">
          <p className="text-xs sm:text-sm text-gray-600">
            Quantity: {item.quantity}
          </p>
          <p className="text-xs text-gray-500">Price for 4 pieces per item</p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Truck className="w-3 h-3 flex-shrink-0" />
            <span className="break-words">
              Shipping: {formatPrice(item.product.shippingCost)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="break-words">
              Delivery: {item.product.deliveryTime}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div className="text-right w-full sm:w-auto">
      <span className="font-bold text-gray-900 tracking-tight text-sm sm:text-base">
        {formatPrice(item.product.price * item.quantity)}
      </span>
      <p className="text-xs text-gray-500">
        + {formatPrice(item.product.shippingCost * item.quantity)} shipping
      </p>
    </div>
  </div>
));

OrderItem.displayName = "OrderItem";

const CheckoutProgress = ({ step }: { step: number }) => (
  <div className="mb-6 sm:mb-10">
    <div className="flex justify-between mb-3">
      <span
        className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
          step >= 1 ? "text-primary" : "text-gray-400"
        }`}
      >
        Delivery
      </span>
      <span
        className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
          step >= 2 ? "text-primary" : "text-gray-400"
        }`}
      >
        Payment
      </span>
      <span
        className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
          step >= 3 ? "text-primary" : "text-gray-400"
        }`}
      >
        Confirmation
      </span>
    </div>
    <Progress
      value={(step / 3) * 100}
      className="h-2 sm:h-2.5 rounded-full bg-gray-100"
    />
  </div>
);

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const queryClient = useQueryClient();

  // State
  const [paymentMethod, setPaymentMethod] = useState("pesapal");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userDetails, setUserDetails] = useState<{
    email: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  // Queries
  const { data: items = [], isLoading } = useQuery<CheckoutItem[]>({
    queryKey: ["checkout", productId],
    queryFn: async () =>
      productId ? [await fetchProduct(productId)] : fetchCart(),
  });

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      ),
    [items]
  );

  const shippingCosts = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.product.shippingCost * item.quantity,
        0
      ),
    [items]
  );

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    return appliedDiscount.type === "percentage"
      ? (subtotal * appliedDiscount.value) / 100
      : appliedDiscount.amount;
  }, [appliedDiscount, subtotal]);

  const totalPrice = useMemo(
    () => subtotal - discountAmount,
    [subtotal, discountAmount]
  );

  const { data: deliveryPoints = [], isLoading: isLoadingDeliveryPoints } =
    useQuery<DeliveryPoint[]>({
      queryKey: ["deliveryPoints"],
      queryFn: fetchDeliveryPoints,
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

  const { data: shippingCost = 0 } = useQuery({
    queryKey: ["shippingRate", selectedDeliveryPoint, subtotal],
    queryFn: () => fetchShippingRate(selectedDeliveryPoint, subtotal),
    enabled: !!selectedDeliveryPoint && subtotal > 0,
  });

  const { data: activeDiscount } = useQuery({
    queryKey: ["activeDiscount"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/discounts/active`,
        await axiosHeaders()
      );
      return response.data.discount;
    },
  });

  // Mutations
  const validateDiscountMutation = useMutation({
    mutationFn: (code: string) => validateDiscount(code, subtotal),
    onSuccess: (data) => {
      setAppliedDiscount(data);
      toast.success("Discount applied successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Invalid discount code");
      setAppliedDiscount(null);
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!userDetails) {
        throw new Error("User details not available");
      }

      const shippingDetails = {
        city: form.getValues("shippingDetails.city"),
        subCounty: form.getValues("shippingDetails.subCounty"),
        estateName: form.getValues("shippingDetails.estateName"),
        roadName: form.getValues("shippingDetails.roadName"),
        apartmentName: form.getValues("shippingDetails.apartmentName"),
        houseNumber: form.getValues("shippingDetails.houseNumber"),
        contactNumber: form.getValues("shippingDetails.contactNumber"),
      };

      // Calculate order totals
      const orderSubtotal = items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );

      // Track shipping cost separately but don't add to total
      const orderShippingCost = items.reduce(
        (total, item) =>
          total + (item.product.shippingCost || 0) * item.quantity,
        0
      );

      const orderTotal = orderSubtotal - (discountAmount || 0);

      // Prepare the order data
      const orderData = {
        ...(productId ? { productId, quantity: 1 } : {}),
        products: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
          shippingCost: item.product.shippingCost || 0,
        })),
        paymentMethod: "pesapal",
        paymentDetails: {
          provider: "pesapal",
          status: "pending",
          customerEmail: userDetails.email,
          customerName:
            `${userDetails.firstName} ${userDetails.lastName}`.trim(),
        },
        shippingDetails,
        subtotal: orderSubtotal,
        shippingCost: orderShippingCost, // Store shipping cost for reference
        total: orderTotal, // Total without adding shipping (it's already in product prices)
        discount: appliedDiscount
          ? {
              code: appliedDiscount.code,
              type: appliedDiscount.type,
              value: appliedDiscount.value,
              amount: discountAmount,
            }
          : null,
      };

      // First initiate Pesapal payment
      const pesapalResponse = await axios.post(
        `${BACKEND_URL}/api/payments/pesapal/initiate`,
        orderData,
        await axiosHeaders()
      );

      if (!pesapalResponse.data.redirectUrl) {
        throw new Error("No redirect URL received from payment provider");
      }

      // Store order details for post-payment handling
      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          trackingId: pesapalResponse.data.trackingId,
          orderId: pesapalResponse.data.order._id,
          amount: orderTotal, // Store the total without additional shipping
        })
      );

      return pesapalResponse.data;
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        // Clear cart before redirecting
        queryClient.setQueryData(["cart"], []);

        // Show success message
        toast.success("Redirecting to payment gateway...");

        // Redirect to Pesapal
        window.location.href = data.redirectUrl;
      }
    },
    onError: (error: any) => {
      console.error("Payment initiation error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to process order. Please try again."
      );
      setShowConfirmation(false);
    },
  });

  const backLink = useMemo(
    () => (productId ? `/products/${productId}` : "/cart"),
    [productId]
  );

  // Utility Functions
  const getSelectedPoint = (points: DeliveryPoint[], id: string) =>
    points.find((p) => p._id === id);

  const formatMpesaNumber = (input: string) => {
    const numbers = input.replace(/\D/g, "");
    return numbers.startsWith("254")
      ? "+254" + numbers.slice(3)
      : numbers
      ? "+254" + numbers
      : "+254";
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    try {
      // Only validate shipping details since we're using Pesapal
      shippingSchema.parse(form.getValues());
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map((err) => err.message));
      }
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  // Event Handlers
  const handlePayment = async () => {
    if (validateForm()) {
      setCheckoutStep(3);
      setShowConfirmation(true);
    }
  };

  const handleApplyDiscount = () => {
    if (!discountCode) {
      toast.error("Please enter a discount code");
      return;
    }
    validateDiscountMutation.mutate(discountCode);
  };

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      shippingDetails: {
        city: "",
        subCounty: "",
        estateName: "",
        roadName: "",
        apartmentName: "",
        houseNumber: "",
        contactNumber: "+254",
      },
    },
  });

  const renderFormField = useCallback(
    ({
      name,
      label,
      type = "text",
      placeholder,
      icon: Icon,
      required = true,
    }: {
      name: keyof ShippingFormValues["shippingDetails"];
      label: string;
      type?: string;
      placeholder: string;
      icon: any;
      required?: boolean;
    }) => (
      <FormField
        control={form.control}
        name={`shippingDetails.${name}`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                <Input
                  {...field}
                  type={type}
                  placeholder={placeholder}
                  className="h-10 sm:h-11 pl-10 text-sm sm:text-base"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    [form.control]
  );

  const renderShippingFields = useCallback(
    () => (
      <Form {...form}>
        <Card className="border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Shipping Details
            </CardTitle>
            <CardDescription className="text-sm">
              Enter your delivery information
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField({
                  name: "city",
                  label: "City",
                  placeholder: "e.g., Nairobi",
                  icon: Building,
                })}
                {renderFormField({
                  name: "subCounty",
                  label: "Sub County",
                  placeholder: "e.g., Westlands",
                  icon: MapPin,
                })}
              </div>

              {renderFormField({
                name: "estateName",
                label: "Estate Name",
                placeholder: "e.g., Kileleshwa",
                icon: Home,
              })}

              {renderFormField({
                name: "roadName",
                label: "Road/Street Name",
                placeholder: "e.g., Moi Avenue",
                icon: MapPin,
              })}

              {renderFormField({
                name: "apartmentName",
                label: "Apartment Name",
                placeholder: "e.g., Sunrise Apartments",
                icon: Building,
                required: false,
              })}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField({
                  name: "houseNumber",
                  label: "House Number",
                  placeholder: "e.g., A1",
                  icon: Home,
                })}
                {renderFormField({
                  name: "contactNumber",
                  label: "Contact Number",
                  placeholder: "+254712345678",
                  icon: PhoneIcon,
                  type: "tel",
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </Form>
    ),
    [renderFormField]
  );

  useEffect(() => {
    if (activeDiscount && subtotal > 0) {
      validateDiscount(activeDiscount.code, subtotal)
        .then((discountData) => {
          setAppliedDiscount(discountData);
          toast.success("Discount automatically applied!");
        })
        .catch((error) => {
          console.error("Failed to apply automatic discount:", error);
        });
    }
  }, [activeDiscount, subtotal]);

  // Add a useEffect to handle post-payment redirect
  useEffect(() => {
    const status = searchParams.get("pesapal_status");
    const pendingOrder = localStorage.getItem("pendingOrder");

    if (status && pendingOrder) {
      try {
        const orderDetails = JSON.parse(pendingOrder);

        // Clear the pending order from storage
        localStorage.removeItem("pendingOrder");

        // Redirect to order details page
        router.push(`/orders/${orderDetails.orderId}`);

        // Show appropriate toast message
        if (status.toLowerCase() === "completed") {
          toast.success("Payment successful! Your order has been confirmed.");
        } else {
          toast.error("Payment was not completed. Please try again.");
        }
      } catch (error) {
        console.error("Error handling payment redirect:", error);
      }
    }
  }, [searchParams, router]);

  // Add effect to fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      const details = await getUserPaymentDetails();
      if (details) {
        setUserDetails(details);
      }
    };

    fetchUserDetails();
  }, []);

  if (isLoading || !userDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="h-10 w-10 sm:h-14 sm:w-14 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 sm:py-14 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6 sm:mb-10">
          <Link
            href={backLink}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">
              {productId ? "Back to Product" : "Back to Cart"}
            </span>
          </Link>
          <h1 className="text-xl sm:text-3xl font-bold text-center flex-1 mr-8 tracking-tight">
            Secure Checkout
          </h1>
        </div>

        <CheckoutProgress step={checkoutStep} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
          <div className="space-y-6 sm:space-y-8">
            {/* Shipping Section */}
            {renderShippingFields()}

            {/* Order Summary */}
            <Card className="h-fit border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg sm:text-xl">
                  Order Summary
                </CardTitle>
                <CardDescription className="text-sm">
                  Review your items
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 sm:space-y-5">
                  {items.map((item) => (
                    <OrderItem key={item._id} item={item} />
                  ))}
                  <Separator className="my-4 sm:my-6" />

                  {/* Price Breakdown */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-gray-700 text-sm">
                      <span>Subtotal (Items)</span>
                      <div className="text-right">
                        <span className="font-medium">
                          {formatPrice(subtotal)}
                        </span>
                        <div className="text-xs text-gray-500 mt-0.5">
                          All prices are for 4 pieces per item
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-gray-700 text-sm">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        <span>Shipping Cost (Already included in price)</span>
                      </div>
                      <span className="font-medium text-gray-500">
                        {formatPrice(shippingCosts)}
                      </span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span>Discount ({appliedDiscount.code})</span>
                        <span className="font-medium">
                          -{formatPrice(discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg text-gray-900">
                      <span>Total</span>
                      <div className="text-right">
                        <span>{formatPrice(totalPrice)}</span>
                        <div className="text-xs font-normal text-gray-500">
                          Shipping cost already included in price
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Options */}
          <Card className="h-fit border-green-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                Payment Method
              </CardTitle>
              <CardDescription className="text-sm">
                Secure payment via Pesapal
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Pesapal Payment Info Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 sm:p-8 border border-gray-200">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Image
                      src="/pesapal-logo.png"
                      alt="Pesapal"
                      width={250}
                      height={250}
                    />

                    <div>
                      <h3 className="font-semibold text-green-700 text-lg sm:text-xl mb-2">
                        Pay Securely with Pesapal
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                        You'll be redirected to Pesapal's secure payment
                        platform to complete your purchase
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Methods Supported */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Supported Payment Methods:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center justify-center bg-white rounded-lg p-4 border border-green-100 hover:border-green-300 transition-colors">
                      <CreditCard className="w-6 h-6 text-green-600 mb-2" />
                      <span className="text-xs text-gray-600">Credit Card</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-white rounded-lg p-4 border border-green-100 hover:border-green-300 transition-colors">
                      <PhoneIcon className="w-6 h-6 text-green-600 mb-2" />
                      <span className="text-xs text-gray-600">M-PESA</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-white rounded-lg p-4 border border-green-100 hover:border-green-300 transition-colors">
                      <Building className="w-6 h-6 text-green-600 mb-2" />
                      <span className="text-xs text-gray-600">
                        Bank Transfer
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-white rounded-lg p-4 border border-green-100 hover:border-green-300 transition-colors">
                      <Image
                        src="/pesapal-logo.png"
                        alt="Pesapal"
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                      <span className="text-xs text-gray-600">
                        Other Methods
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-green-100 hover:border-green-300 transition-colors">
                    <div className="bg-green-50 p-2 rounded-full">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-gray-900 mb-1">
                        Secure Payment
                      </h5>
                      <p className="text-xs text-gray-600">
                        Your payment information is encrypted
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-green-100 hover:border-green-300 transition-colors">
                    <div className="bg-green-50 p-2 rounded-full">
                      <Lock className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-gray-900 mb-1">
                        Safe & Protected
                      </h5>
                      <p className="text-xs text-gray-600">
                        Your data is protected at all times
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handlePayment}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Pay {formatPrice(totalPrice)}
                  </div>
                )}
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                <span>Secured by Pesapal</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Order Confirmation Dialog */}
        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogContent className="max-w-md bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Image
                  src="/pesapal-logo.png"
                  alt="Pesapal"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                Confirm Your Order
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-600 mt-2">
                You're about to place an order for{" "}
                <span className="font-medium text-green-600">
                  {formatPrice(totalPrice)}
                </span>
                . You'll be redirected to Pesapal's secure payment platform to
                complete your purchase.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Order Summary Section */}
            <div className="space-y-4 my-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">
                  Order Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium text-gray-900">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount:</span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Total:</span>
                      <span className="font-bold text-primary">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Details Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">
                  Delivery Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="text-gray-600">
                      {form.getValues("shippingDetails.estateName")},{" "}
                      {form.getValues("shippingDetails.roadName")},{" "}
                      {form.getValues("shippingDetails.city")}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <PhoneIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="text-gray-600">
                      {form.getValues("shippingDetails.contactNumber")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">
                  Customer Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="text-gray-600">{userDetails?.email}</div>
                  </div>
                  {(userDetails?.firstName || userDetails?.lastName) && (
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="text-gray-600">
                        {`${userDetails?.firstName} ${userDetails?.lastName}`.trim()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg mb-6">
              <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-xs text-gray-600">
                Your payment will be securely processed by Pesapal
              </p>
            </div>

            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="border-gray-200 hover:bg-gray-50 text-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createOrderMutation.mutate()}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Image
                      src="/pesapal-logo.png"
                      alt="Pesapal"
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                    Proceed to Payment
                  </div>
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

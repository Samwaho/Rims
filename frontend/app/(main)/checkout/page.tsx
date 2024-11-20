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
import { sendOrderConfirmationEmail, initEmailJS } from "@/lib/emailService";
import emailjs from "@emailjs/browser";

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
  <div className="flex justify-between items-center bg-gray-50/80 p-5 rounded-xl hover:bg-gray-100/90 transition-all duration-300 border border-gray-100">
    <div className="flex items-center gap-5">
      <div className="w-20 h-20 relative rounded-lg overflow-hidden shadow-sm">
        <img
          src={item.product.images[0]}
          alt={item.product.name}
          className="object-cover w-full h-full transform hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-gray-900 tracking-tight">
          {item.product.name}
        </p>
        <div className="space-y-0.5">
          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
          <p className="text-xs text-gray-500">Price for 4 pieces per item</p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Truck className="w-3 h-3" />
            <span>Shipping: {formatPrice(item.product.shippingCost)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span>Delivery: {item.product.deliveryTime}</span>
          </div>
        </div>
      </div>
    </div>
    <div className="text-right">
      <span className="font-bold text-gray-900 tracking-tight">
        {formatPrice(
          (item.product.price + item.product.shippingCost) * item.quantity
        )}
      </span>
      <p className="text-xs text-gray-500">Including shipping</p>
    </div>
  </div>
));

OrderItem.displayName = "OrderItem";

const CheckoutProgress = ({ step }: { step: number }) => (
  <div className="mb-10">
    <div className="flex justify-between mb-3">
      <span
        className={`text-sm font-medium transition-colors duration-300 ${
          step >= 1 ? "text-primary" : "text-gray-400"
        }`}
      >
        Delivery
      </span>
      <span
        className={`text-sm font-medium transition-colors duration-300 ${
          step >= 2 ? "text-primary" : "text-gray-400"
        }`}
      >
        Payment
      </span>
      <span
        className={`text-sm font-medium transition-colors duration-300 ${
          step >= 3 ? "text-primary" : "text-gray-400"
        }`}
      >
        Confirmation
      </span>
    </div>
    <Progress
      value={(step / 3) * 100}
      className="h-2.5 rounded-full bg-gray-100"
    />
  </div>
);

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const queryClient = useQueryClient();

  // Add an effect to handle initialization
  useEffect(() => {
    // Any initialization logic can go here
  }, []);

  // State
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [mpesaNumber, setMpesaNumber] = useState("+254");
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    bankName: "",
    accountHolder: "",
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Queries
  const { data: items = [], isLoading } = useQuery<CheckoutItem[]>({
    queryKey: ["checkout", productId],
    queryFn: async () =>
      productId ? [await fetchProduct(productId)] : fetchCart(),
  });

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          item.product.price * item.quantity +
          item.product.shippingCost * item.quantity,
        0
      ),
    [items]
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
      const response = await axios.post(
        `${BACKEND_URL}/api/orders`,
        {
          ...(productId ? { productId, quantity: 1 } : {}),
          paymentMethod,
          paymentDetails:
            paymentMethod === "mpesa" ? { mpesaNumber } : bankDetails,
          shippingDetails: {
            city: form.getValues("shippingDetails.city"),
            subCounty: form.getValues("shippingDetails.subCounty"),
            estateName: form.getValues("shippingDetails.estateName"),
            apartmentName: form.getValues("shippingDetails.apartmentName"),
            houseNumber: form.getValues("shippingDetails.houseNumber"),
            contactNumber: form.getValues("shippingDetails.contactNumber"),
          },
          discount: appliedDiscount
            ? {
                code: appliedDiscount.code,
                type: appliedDiscount.type,
                value: appliedDiscount.value,
                amount: discountAmount,
              }
            : null,
        },
        await axiosHeaders()
      );

      // Send confirmation email
      try {
        await sendOrderConfirmationEmail(
          response.data.order.user.email,
          response.data.order
        );
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't throw the error as we don't want to affect the order creation
      }

      return response.data.order._id;
    },
    onSuccess: (orderId) => {
      const successMessage =
        paymentMethod === "mpesa"
          ? "Order placed successfully! Please check your phone for payment prompts."
          : "Order placed successfully! Please complete the bank transfer using the provided details.";

      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      router.push(`/orders/${orderId}`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to process order. Please try again."
      );
    },
  });

  // Memoized Values
  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    return appliedDiscount.type === "percentage"
      ? (subtotal * appliedDiscount.value) / 100
      : appliedDiscount.amount;
  }, [appliedDiscount, subtotal]);

  const totalPrice = useMemo(
    () => subtotal + shippingCost - discountAmount,
    [subtotal, shippingCost, discountAmount]
  );

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
      if (paymentMethod === "mpesa") {
        mpesaNumberSchema.parse(mpesaNumber);
      } else {
        bankDetailsSchema.parse(bankDetails);
      }

      // Validate shipping details
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
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  {...field}
                  type={type}
                  placeholder={placeholder}
                  className="h-11 pl-10"
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
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="w-5 h-5 text-primary" />
              Shipping Details
            </CardTitle>
            <CardDescription>Enter your delivery information</CardDescription>
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="h-14 w-14 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-10">
          <Link
            href={backLink}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {productId ? "Back to Product" : "Back to Cart"}
          </Link>
          <h1 className="text-3xl font-bold text-center flex-1 mr-8 tracking-tight">
            Secure Checkout
          </h1>
        </div>

        <CheckoutProgress step={checkoutStep} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            {/* Shipping Section */}
            {renderShippingFields()}

            {/* Order Summary */}
            <Card className="h-fit border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl">Order Summary</CardTitle>
                <CardDescription>Review your items</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {items.map((item) => (
                    <OrderItem key={item._id} item={item} />
                  ))}
                  <Separator className="my-6" />

                  {!appliedDiscount && (
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="flex-1 h-12"
                      />
                      <Button
                        onClick={handleApplyDiscount}
                        disabled={validateDiscountMutation.isPending}
                        variant="outline"
                        className="h-12 px-6 hover:bg-primary hover:text-primary-foreground"
                      >
                        Apply
                      </Button>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal (Items)</span>
                      <div className="text-right">
                        <span className="font-medium">
                          {formatPrice(
                            items.reduce(
                              (total, item) =>
                                total + item.product.price * item.quantity,
                              0
                            )
                          )}
                        </span>
                        <div className="text-xs text-gray-500 mt-0.5">
                          All prices are for 4 pieces per item
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping Total</span>
                      <span className="font-medium">
                        {formatPrice(
                          items.reduce(
                            (total, item) =>
                              total + item.product.shippingCost * item.quantity,
                            0
                          )
                        )}
                      </span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          Discount ({appliedDiscount.code}
                          {appliedDiscount.type === "percentage"
                            ? ` - ${appliedDiscount.value}%`
                            : ""}
                          )
                        </span>
                        <span className="font-medium">
                          -{formatPrice(discountAmount)}
                        </span>
                      </div>
                    )}
                    <Separator className="my-4" />
                    <div className="flex justify-between font-bold text-xl text-gray-900">
                      <span>Total</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Options */}
          <Card className="h-fit border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl">Payment Method</CardTitle>
              <CardDescription>
                Choose your preferred payment option below
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs
                value={paymentMethod}
                onValueChange={(value) => {
                  setPaymentMethod(value);
                  setCheckoutStep(2);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger
                    value="mpesa"
                    className="data-[state=active]:bg-green-50 py-3"
                  >
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    Mpesa
                  </TabsTrigger>
                  <TabsTrigger
                    value="bank"
                    className="data-[state=active]:bg-blue-50 py-3"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Bank Transfer
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="mpesa">
                  <div className="space-y-8">
                    <div className="flex items-center justify-center bg-green-50 p-8 rounded-xl border border-green-100">
                      <PhoneIcon className="w-14 h-14 text-green-600 mr-5" />
                      <div>
                        <h3 className="font-semibold text-green-800 text-xl mb-1">
                          Pay with Mpesa
                        </h3>
                        <p className="text-green-600">
                          Fast and secure mobile payment
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="mpesa-number" className="text-gray-700">
                        Mpesa Number
                      </Label>
                      <Input
                        id="mpesa-number"
                        placeholder="+254712345678"
                        value={mpesaNumber}
                        onChange={(e) =>
                          setMpesaNumber(formatMpesaNumber(e.target.value))
                        }
                        className="text-lg h-12"
                        maxLength={13}
                      />
                      <p className="text-sm text-gray-500">
                        Enter your Mpesa number in international format
                      </p>
                    </div>
                  </div>
                  {formErrors.length > 0 && (
                    <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
                      {formErrors.map((error, index) => (
                        <p key={index} className="text-red-600 text-sm">
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="bank">
                  <div className="space-y-8">
                    <div className="flex items-center justify-center bg-blue-50 p-8 rounded-xl border border-blue-100">
                      <CreditCard className="w-14 h-14 text-blue-600 mr-5" />
                      <div>
                        <h3 className="font-semibold text-blue-800 text-xl mb-1">
                          Bank Transfer
                        </h3>
                        <p className="text-blue-600">
                          Secure bank-to-bank transfer
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-5">
                      <div className="space-y-3">
                        <Label htmlFor="account-name" className="text-gray-700">
                          Account Holder Name
                        </Label>
                        <Input
                          id="account-name"
                          placeholder="Enter the name on your account"
                          value={bankDetails.accountHolder}
                          onChange={(e) =>
                            setBankDetails({
                              ...bankDetails,
                              accountHolder: e.target.value,
                            })
                          }
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="account-number"
                          className="text-gray-700"
                        >
                          Account Number
                        </Label>
                        <Input
                          id="account-number"
                          placeholder="Enter your account number"
                          value={bankDetails.accountNumber}
                          onChange={(e) =>
                            setBankDetails({
                              ...bankDetails,
                              accountNumber: e.target.value,
                            })
                          }
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="bank-name" className="text-gray-700">
                          Bank Name
                        </Label>
                        <Input
                          id="bank-name"
                          placeholder="Enter your bank name"
                          value={bankDetails.bankName}
                          onChange={(e) =>
                            setBankDetails({
                              ...bankDetails,
                              bankName: e.target.value,
                            })
                          }
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                className="w-full h-12 text-lg font-medium"
                onClick={handlePayment}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Pay {formatPrice(totalPrice)}
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 text-center">
                By clicking Pay, you agree to our Terms and Conditions
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Order Confirmation Dialog */}
        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
              <AlertDialogDescription>
                You're about to place an order for {formatPrice(totalPrice)}.
                All prices are for 4 pieces per item.
                {paymentMethod === "mpesa"
                  ? " You'll receive an Mpesa prompt on your phone."
                  : " Please ensure your bank details are correct."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="p-4 bg-muted rounded-lg my-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Items:
                  </span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Delivery Point:
                  </span>
                  <span className="font-medium">
                    {
                      getSelectedPoint(deliveryPoints, selectedDeliveryPoint)
                        ?.name
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Payment Method:
                  </span>
                  <span className="font-medium capitalize">
                    {paymentMethod}
                  </span>
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmation(false);
                  createOrderMutation.mutate();
                }}
                className="ml-2"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Confirm Order"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

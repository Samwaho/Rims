"use client";

import { useEffect } from "react";
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
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { z } from "zod";
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

// Types
interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

interface CheckoutItem {
  _id: string;
  product: Product;
  quantity: number;
}

interface TaxConfig {
  rate: number;
  name: string;
}

interface ShippingRate {
  cost: number;
  name: string;
}

interface Discount {
  amount: number;
  type: "percentage" | "fixed";
  code: string;
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
const mpesaNumberSchema = z.string().regex(/^254\d{9}$/, {
  message: "Please enter a valid Mpesa number starting with 254",
});

const bankDetailsSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountHolder: z.string().min(1, "Account holder name is required"),
});

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

const fetchTaxConfig = async (): Promise<TaxConfig> => {
  const response = await axios.get(
    `${BACKEND_URL}/api/tax`,
    await axiosHeaders()
  );
  return response.data[0]; // Assuming we're using the first tax config
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
  return response.data;
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
  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 relative rounded-md overflow-hidden">
        <img
          src={item.product.images[0]}
          alt={item.product.name}
          className="object-cover w-full h-full"
        />
      </div>
      <div>
        <p className="font-medium text-gray-900">{item.product.name}</p>
        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
      </div>
    </div>
    <span className="font-semibold text-gray-900">
      {formatPrice(item.product.price * item.quantity)}
    </span>
  </div>
));

OrderItem.displayName = "OrderItem";

const CheckoutProgress = ({ step }: { step: number }) => (
  <div className="mb-8">
    <div className="flex justify-between mb-2">
      <span
        className={`text-sm ${step >= 1 ? "text-primary" : "text-gray-400"}`}
      >
        Delivery
      </span>
      <span
        className={`text-sm ${step >= 2 ? "text-primary" : "text-gray-400"}`}
      >
        Payment
      </span>
      <span
        className={`text-sm ${step >= 3 ? "text-primary" : "text-gray-400"}`}
      >
        Confirmation
      </span>
    </div>
    <Progress value={(step / 3) * 100} className="h-2" />
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
  const [mpesaNumber, setMpesaNumber] = useState("");
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
        (total, item) => total + item.product.price * item.quantity,
        0
      ),
    [items]
  );

  const { data: taxConfig } = useQuery<TaxConfig>({
    queryKey: ["tax-config"],
    queryFn: fetchTaxConfig,
  });

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
          deliveryPointId: selectedDeliveryPoint,
          discountCode: appliedDiscount?.code,
        },
        await axiosHeaders()
      );
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
  const taxAmount = useMemo(
    () => (taxConfig ? subtotal * (taxConfig.rate / 100) : 0),
    [subtotal, taxConfig]
  );

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    return appliedDiscount.type === "percentage"
      ? subtotal * (appliedDiscount.amount / 100)
      : appliedDiscount.amount;
  }, [appliedDiscount, subtotal]);

  const totalPrice = useMemo(
    () => subtotal + taxAmount + shippingCost - discountAmount,
    [subtotal, taxAmount, shippingCost, discountAmount]
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
    return numbers.startsWith("254") ? numbers : numbers ? "254" + numbers : "";
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!selectedDeliveryPoint) {
      errors.push("Please select a pickup location");
    }

    try {
      if (paymentMethod === "mpesa") {
        mpesaNumberSchema.parse(mpesaNumber);
      } else {
        bankDetailsSchema.parse(bankDetails);
      }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <Link
            href={backLink}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {productId ? "Back to Product" : "Back to Cart"}
          </Link>
          <h1 className="text-3xl font-bold text-center flex-1 mr-8">
            Secure Checkout
          </h1>
        </div>

        <CheckoutProgress step={checkoutStep} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Shipping Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Select Pickup Location
                </CardTitle>
                <CardDescription>
                  Choose your preferred delivery point for order collection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingDeliveryPoints ? (
                  <div className="space-y-4">
                    <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
                    <div className="h-32 bg-gray-200 animate-pulse rounded-md"></div>
                  </div>
                ) : deliveryPoints.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No delivery points available
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="delivery-point">Pickup Location</Label>
                    <Select
                      value={selectedDeliveryPoint}
                      onValueChange={(value) => {
                        setSelectedDeliveryPoint(value);
                        setCheckoutStep(1);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a pickup point" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryPoints.map((point) => (
                          <SelectItem key={point._id} value={point._id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{point.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {point.freeShippingThreshold &&
                                subtotal >= point.freeShippingThreshold
                                  ? "Free"
                                  : formatPrice(point.baseRate)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedDeliveryPoint && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      {(() => {
                        const point = getSelectedPoint(
                          deliveryPoints,
                          selectedDeliveryPoint
                        );
                        if (!point) return null;

                        return (
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                              <div className="space-y-1">
                                <p className="font-medium">{point.location}</p>
                                {point.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {point.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {point.operatingHours && (
                              <div className="flex items-center gap-4">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <p className="text-sm">
                                  {point.operatingHours}
                                </p>
                              </div>
                            )}

                            {(point.contactInfo?.phone ||
                              point.contactInfo?.email) && (
                              <div className="space-y-2">
                                {point.contactInfo?.phone && (
                                  <div className="flex items-center gap-4">
                                    <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                                    <p className="text-sm">
                                      {point.contactInfo.phone}
                                    </p>
                                  </div>
                                )}
                                {point.contactInfo?.email && (
                                  <div className="flex items-center gap-4">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <p className="text-sm">
                                      {point.contactInfo.email}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {point.freeShippingThreshold && (
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <div className="flex items-center gap-2 text-sm text-green-600 cursor-help">
                                    <Info className="w-4 h-4" />
                                    Free pickup available
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <p>
                                    Free pickup is available for orders over{" "}
                                    {formatPrice(point.freeShippingThreshold)}
                                  </p>
                                </HoverCardContent>
                              </HoverCard>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="h-fit">
              <CardHeader className="border-b">
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your items</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <OrderItem key={item._id} item={item} />
                  ))}
                  <Separator className="my-4" />

                  {/* Discount Code Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleApplyDiscount}
                      disabled={validateDiscountMutation.isPending}
                      variant="outline"
                    >
                      Apply
                    </Button>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {taxConfig && (
                      <div className="flex justify-between text-gray-600">
                        <span>
                          {taxConfig.name} ({taxConfig.rate}%)
                        </span>
                        <span>{formatPrice(taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          Pickup Fee
                          {selectedDeliveryPoint &&
                            ` - ${
                              deliveryPoints.find(
                                (p) => p._id === selectedDeliveryPoint
                              )?.name
                            }`}
                        </span>
                      </div>
                      <span
                        className={shippingCost === 0 ? "text-green-600" : ""}
                      >
                        {shippingCost === 0
                          ? "Free"
                          : formatPrice(shippingCost)}
                      </span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          Discount ({appliedDiscount.code})
                          {appliedDiscount.type === "percentage" &&
                            ` - ${appliedDiscount.amount}%`}
                        </span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg text-gray-900">
                      <span>Total</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Options */}
          <Card className="h-fit">
            <CardHeader className="border-b">
              <CardTitle>Payment Method</CardTitle>
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
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="mpesa"
                    className="data-[state=active]:bg-green-50"
                  >
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    Mpesa
                  </TabsTrigger>
                  <TabsTrigger
                    value="bank"
                    className="data-[state=active]:bg-blue-50"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Bank Transfer
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="mpesa">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center bg-green-50 p-6 rounded-xl border border-green-100">
                      <PhoneIcon className="w-12 h-12 text-green-600 mr-4" />
                      <div>
                        <h3 className="font-semibold text-green-800 text-lg">
                          Pay with Mpesa
                        </h3>
                        <p className="text-green-600">
                          Fast and secure mobile payment
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mpesa-number">Mpesa Number</Label>
                      <Input
                        id="mpesa-number"
                        placeholder="254712345678"
                        value={mpesaNumber}
                        onChange={(e) =>
                          setMpesaNumber(formatMpesaNumber(e.target.value))
                        }
                        className="text-lg"
                        maxLength={12}
                      />
                      <p className="text-sm text-gray-500">
                        Enter your Mpesa number in international format
                      </p>
                    </div>
                  </div>
                  {formErrors.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 rounded-md">
                      {formErrors.map((error, index) => (
                        <p key={index} className="text-red-600 text-sm">
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="bank">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center bg-blue-50 p-6 rounded-xl border border-blue-100">
                      <CreditCard className="w-12 h-12 text-blue-600 mr-4" />
                      <div>
                        <h3 className="font-semibold text-blue-800 text-lg">
                          Bank Transfer
                        </h3>
                        <p className="text-blue-600">
                          Secure bank-to-bank transfer
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="account-name">
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-number">Account Number</Label>
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bank-name">Bank Name</Label>
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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
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

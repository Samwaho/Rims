"use client";

import React, { useState } from "react";
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
import { Phone, CreditCard, CheckCircle, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
}

const fetchCart = async (): Promise<CartItem[]> => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`,
    await axiosHeaders()
  );
  return response.data;
};

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });

  const totalPrice = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    bankName: "",
    accountHolder: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePayment = async () => {
    if (paymentMethod === "mpesa" && !mpesaNumber) {
      toast.error("Please enter your Mpesa number");
      return;
    }

    if (
      paymentMethod === "bank" &&
      (!bankDetails.accountNumber ||
        !bankDetails.bankName ||
        !bankDetails.accountHolder)
    ) {
      toast.error("Please fill in all bank details");
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentDetails =
        paymentMethod === "mpesa"
          ? { paymentMethod, totalPrice, mpesaNumber }
          : { paymentMethod, totalPrice, ...bankDetails };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/checkout`,
        paymentDetails,
        await axiosHeaders()
      );
      toast.success(
        "Payment initiated successfully! Please check your phone for prompts."
      );
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <Link
            href="/cart"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-center flex-1 mr-8">
            Secure Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader className="border-b">
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your items</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 relative rounded-md overflow-hidden">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                onValueChange={setPaymentMethod}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="mpesa"
                    className="data-[state=active]:bg-green-50"
                  >
                    <Phone className="w-4 h-4 mr-2" />
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
                      <Phone className="w-12 h-12 text-green-600 mr-4" />
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
                        placeholder="e.g. 254712345678"
                        value={mpesaNumber}
                        onChange={(e) => setMpesaNumber(e.target.value)}
                        className="text-lg"
                      />
                      <p className="text-sm text-gray-500">
                        Enter your Mpesa number in international format
                      </p>
                    </div>
                  </div>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
      </div>
    </div>
  );
}

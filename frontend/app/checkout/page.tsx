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
import { Phone, CreditCard, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

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

export default function CheckoutPage() {
  const { data: cartItems = [] } = useQuery<CartItem[]>({
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

  const handlePayment = async () => {
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
      toast.success("Payment successful");
    } catch (error) {
      toast.error("Payment failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm"
                  >
                    <span className="font-medium text-gray-700">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Choose your preferred payment option
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mpesa">
                    <Phone className="w-4 h-4 mr-2" />
                    Mpesa
                  </TabsTrigger>
                  <TabsTrigger value="bank">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Bank Transfer
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="mpesa">
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-center bg-green-100 p-4 rounded-lg">
                      <Phone className="w-12 h-12 text-green-600 mr-4" />
                      <div>
                        <h3 className="font-semibold text-green-800">
                          Pay with Mpesa
                        </h3>
                        <p className="text-sm text-green-600">
                          Fast and secure mobile payment
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mpesa-number">Mpesa Number</Label>
                      <Input
                        id="mpesa-number"
                        placeholder="Enter your Mpesa number"
                        value={mpesaNumber}
                        onChange={(e) => setMpesaNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="bank">
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-center bg-blue-100 p-4 rounded-lg">
                      <CreditCard className="w-12 h-12 text-blue-600 mr-4" />
                      <div>
                        <h3 className="font-semibold text-blue-800">
                          Bank Transfer
                        </h3>
                        <p className="text-sm text-blue-600">
                          Secure bank-to-bank transfer
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-name">Account Name</Label>
                      <Input
                        id="account-name"
                        placeholder="Enter account name"
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
                        placeholder="Enter account number"
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
                        placeholder="Enter bank name"
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
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handlePayment}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Payment
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

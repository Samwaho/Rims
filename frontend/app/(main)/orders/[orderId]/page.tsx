"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, Truck, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OrderProduct {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
}

interface Order {
  _id: string;
  products: OrderProduct[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  paymentMethod: "mpesa" | "bank";
  paymentStatus: "pending" | "completed" | "failed";
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    address: string;
    city: string;
  };
  shippingInfo?: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
    updatedAt?: string;
  };
}

const getOrderStatus = (status: Order["status"]) => {
  const statusMap = {
    pending: { icon: Clock, color: "text-yellow-500", text: "Order Pending" },
    processing: { icon: Package, color: "text-blue-500", text: "Processing" },
    shipped: { icon: Truck, color: "text-purple-500", text: "Shipped" },
    delivered: {
      icon: CheckCircle,
      color: "text-green-500",
      text: "Delivered",
    },
    cancelled: {
      icon: Clock,
      color: "text-red-500",
      text: "Cancelled",
    },
  };

  return statusMap[status];
};

export default function OrderConfirmationPage({
  params,
}: {
  params: { orderId: string };
}) {
  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order>({
    queryKey: ["order", params.orderId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${params.orderId}`,
        await axiosHeaders()
      );
      return response.data.order;
    },
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load order details. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const StatusComponent = getOrderStatus(order.status);
  const orderDate = new Date(order.orderDate);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-gray-600">Order #{order._id.slice(-8)}</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1">Order Date</p>
                <p className="text-gray-600">
                  {format(orderDate, "MMMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
              {order.paymentMethod && (
                <div>
                  <p className="font-semibold mb-1">Payment Method</p>
                  <p className="text-gray-600">{order.paymentMethod}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {order.shippingAddress && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Full Name</p>
                  <p className="font-medium">
                    {order.shippingAddress.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Phone Number</p>
                  <p className="font-medium">
                    {order.shippingAddress.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Address</p>
                  <p className="font-medium">{order.shippingAddress.address}</p>
                </div>
                <div>
                  <p className="text-gray-600">City</p>
                  <p className="font-medium">{order.shippingAddress.city}</p>
                </div>
                {order.shippingInfo?.trackingNumber && (
                  <div className="col-span-full">
                    <p className="text-gray-600">Tracking Number</p>
                    <p className="font-medium">
                      {order.shippingInfo.trackingNumber}
                    </p>
                  </div>
                )}
                {order.shippingInfo?.carrier && (
                  <div className="col-span-full">
                    <p className="text-gray-600">Carrier</p>
                    <p className="font-medium">{order.shippingInfo.carrier}</p>
                  </div>
                )}
                {order.shippingInfo?.estimatedDelivery && (
                  <div className="col-span-full">
                    <p className="text-gray-600">Estimated Delivery</p>
                    <p className="font-medium">
                      {order.shippingInfo.estimatedDelivery}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Status</span>
              <div className={`flex items-center ${StatusComponent.color}`}>
                <StatusComponent.icon className="w-5 h-5 mr-2" />
                <span>{StatusComponent.text}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Order Timeline */}
              <div className="relative">
                <div className="absolute left-8 top-0 h-full w-0.5 bg-gray-200"></div>
                {["pending", "processing", "shipped", "delivered"].map(
                  (step, index) => {
                    const isCompleted =
                      ["pending", "processing", "shipped", "delivered"].indexOf(
                        order.status
                      ) >= index;
                    const StatusIcon = getOrderStatus(
                      step as Order["status"]
                    ).icon;
                    return (
                      <div
                        key={step}
                        className="relative flex items-center mb-8 last:mb-0"
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? "bg-green-100 text-green-500"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <StatusIcon className="w-8 h-8" />
                        </div>
                        <div className="ml-4">
                          <h3
                            className={`font-medium ${
                              isCompleted ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {getOrderStatus(step as Order["status"]).text}
                          </h3>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.products.map((item, index) => (
                <div
                  key={item.product?._id || index}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 relative rounded-md overflow-hidden">
                      <img
                        src={
                          item.product?.images?.[0] ||
                          "/images/placeholder-product.png"
                        }
                        alt={item.product?.name || "Product"}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        {item.product?.name || "Product Not Found"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">
                    {formatPrice((item.product?.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

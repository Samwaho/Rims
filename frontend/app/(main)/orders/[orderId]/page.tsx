"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Package,
  Plane,
  Clock,
  ArrowLeft,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { memo, useMemo } from "react";
import Image from "next/image";

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
  subtotal: number;
  discount: number;
  discountDetails?: {
    code: string;
    type: "percentage" | "fixed";
    value: number;
  };
  shippingCost: number;
  total: number;
  status:
    | "pending"
    | "processing"
    | "in_transit"
    | "shipped"
    | "delivered"
    | "cancelled";
  orderDate: string;
  paymentMethod: "mpesa" | "bank";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentDetails?: any;
  shippingDetails: {
    city: string;
    subCounty: string;
    estateName: string;
    apartmentName?: string;
    houseNumber: string;
    contactNumber: string;
  };
  statusHistory?: Array<{
    status: string;
    note?: string;
    timestamp: string;
  }>;
}

const ORDER_STATUS = {
  pending: {
    icon: Clock,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    text: "Order Pending",
  },
  processing: {
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    text: "Processing",
  },
  in_transit: {
    icon: Plane,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    text: "In Transit",
  },
  shipped: {
    icon: Truck,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    text: "Shipped",
  },
  delivered: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-50",
    text: "Delivered",
  },
  cancelled: {
    icon: Clock,
    color: "text-red-500",
    bgColor: "bg-red-50",
    text: "Cancelled",
  },
} as const;

const getOrderStatus = (status: Order["status"]) => ORDER_STATUS[status];

const OrderTimeline = memo(({ status }: { status: Order["status"] }) => {
  const steps = ["pending", "processing", "in_transit", "shipped", "delivered"];
  const currentIndex = steps.indexOf(status);

  return (
    <div className="relative">
      <div className="absolute left-6 sm:left-8 top-0 h-full w-0.5 bg-gray-200" />
      {steps.map((step, index) => {
        const isCompleted = currentIndex >= index;
        const StatusIcon = ORDER_STATUS[step as Order["status"]].icon;
        const { color, bgColor } = ORDER_STATUS[step as Order["status"]];

        return (
          <div
            key={step}
            className="relative flex items-center mb-6 sm:mb-8 last:mb-0"
          >
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                isCompleted
                  ? `${bgColor} ${color}`
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <StatusIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="ml-4">
              <h3
                className={`font-medium text-sm sm:text-base transition-colors duration-200 ${
                  isCompleted ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {ORDER_STATUS[step as Order["status"]].text}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
});

OrderTimeline.displayName = "OrderTimeline";

const OrderProduct = memo(
  ({ item, index }: { item: OrderProduct; index: number }) => (
    <div
      key={item.product?._id || index}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors duration-200"
    >
      <div className="flex items-center space-x-4 w-full sm:w-auto mb-4 sm:mb-0">
        <div className="w-20 h-20 sm:w-16 sm:h-16 relative rounded-md overflow-hidden">
          <Image
            src={item.product?.images?.[0] || "/images/placeholder-product.png"}
            alt={item.product?.name || "Product"}
            fill
            className="object-cover transition-transform duration-200 hover:scale-105"
            sizes="(max-width: 640px) 80px, 64px"
          />
        </div>
        <div>
          <p className="font-medium text-gray-900 hover:text-primary transition-colors duration-200">
            {item.product?.name || "Product Not Found"}
          </p>
          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
        </div>
      </div>
      <span className="font-semibold text-primary ml-24 sm:ml-0">
        {formatPrice((item.product?.price || 0) * item.quantity)}
      </span>
    </div>
  )
);

OrderProduct.displayName = "OrderProduct";

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

  const StatusComponent = useMemo(
    () => (order ? getOrderStatus(order.status) : null),
    [order?.status]
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
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
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!order || !StatusComponent || !order.shippingDetails) return null;

  const orderDate = new Date(order.orderDate);

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/orders"
          className="inline-flex items-center text-gray-600 hover:text-primary mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>

        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${StatusComponent.bgColor} ${StatusComponent.color} mb-4`}
          >
            <StatusComponent.icon className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-gray-600">Order #{order._id.slice(-8)}</p>
        </div>

        <Card className="mb-6 sm:mb-8 hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1 text-gray-700">Order Date</p>
                <p className="text-gray-600">
                  {format(orderDate, "MMMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
              {order.paymentMethod && (
                <div>
                  <p className="font-semibold mb-1 text-gray-700">
                    Payment Method
                  </p>
                  <p className="text-gray-600 capitalize">
                    {order.paymentMethod}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 sm:mb-8 hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Shipping Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">City</p>
                <p className="font-medium text-gray-900">
                  {order.shippingDetails?.city || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Sub County</p>
                <p className="font-medium text-gray-900">
                  {order.shippingDetails?.subCounty || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Estate Name</p>
                <p className="font-medium text-gray-900">
                  {order.shippingDetails?.estateName || "N/A"}
                </p>
              </div>
              {order.shippingDetails?.apartmentName && (
                <div>
                  <p className="text-gray-600 mb-1">Apartment Name</p>
                  <p className="font-medium text-gray-900">
                    {order.shippingDetails.apartmentName}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-600 mb-1">House Number</p>
                <p className="font-medium text-gray-900">
                  {order.shippingDetails?.houseNumber || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Contact Number</p>
                <p className="font-medium text-gray-900">
                  {order.shippingDetails?.contactNumber || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 sm:mb-8 hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Status</span>
              <div
                className={`flex items-center ${StatusComponent.color} ${StatusComponent.bgColor} px-3 py-1.5 rounded-full text-sm`}
              >
                <StatusComponent.icon className="w-4 h-4 mr-2" />
                <span>{StatusComponent.text}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <OrderTimeline status={order.status} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.products.map((item, index) => (
                <OrderProduct
                  key={item.product?._id || index}
                  item={item}
                  index={index}
                />
              ))}

              <div className="border-t pt-4 mt-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount
                      {order.discountDetails && (
                        <>
                          {" "}
                          ({order.discountDetails.code}
                          {order.discountDetails.type === "percentage"
                            ? ` - ${order.discountDetails.value}%`
                            : ""}
                          )
                        </>
                      )}
                    </span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-x-4">
          <Link href="/orders">
            <Button variant="outline" className="hover:bg-gray-100">
              View All Orders
            </Button>
          </Link>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

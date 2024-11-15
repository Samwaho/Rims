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
import { memo, useMemo } from "react";

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
  discountCode?: string;
  tax: number;
  taxRate: number;
  shippingCost: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  paymentMethod: "mpesa" | "bank";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentDetails?: any;
  deliveryPoint: {
    _id: string;
    name: string;
    location: string;
    operatingHours?: string;
    contactInfo?: {
      phone?: string;
      email?: string;
    };
  };
  statusHistory?: Array<{
    status: string;
    note?: string;
    timestamp: string;
  }>;
}

const ORDER_STATUS = {
  pending: { icon: Clock, color: "text-yellow-500", text: "Order Pending" },
  processing: { icon: Package, color: "text-blue-500", text: "Processing" },
  shipped: { icon: Truck, color: "text-purple-500", text: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-green-500", text: "Delivered" },
  cancelled: { icon: Clock, color: "text-red-500", text: "Cancelled" },
} as const;

const getOrderStatus = (status: Order["status"]) => ORDER_STATUS[status];

const OrderTimeline = memo(({ status }: { status: Order["status"] }) => {
  const steps = ["pending", "processing", "shipped", "delivered"];
  const currentIndex = steps.indexOf(status);

  return (
    <div className="relative">
      <div className="absolute left-8 top-0 h-full w-0.5 bg-gray-200" />
      {steps.map((step, index) => {
        const isCompleted = currentIndex >= index;
        const StatusIcon = ORDER_STATUS[step as Order["status"]].icon;

        return (
          <div key={step} className="relative flex items-center mb-8 last:mb-0">
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
      className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 relative rounded-md overflow-hidden">
          <img
            src={item.product?.images?.[0] || "/images/placeholder-product.png"}
            alt={item.product?.name || "Product"}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <p className="font-medium">
            {item.product?.name || "Product Not Found"}
          </p>
          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
        </div>
      </div>
      <span className="font-semibold">
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
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!order || !StatusComponent) return null;

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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Delivery Point</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Location Name</p>
                <p className="font-medium">{order.deliveryPoint.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Address</p>
                <p className="font-medium">{order.deliveryPoint.location}</p>
              </div>
              {order.deliveryPoint.operatingHours && (
                <div>
                  <p className="text-gray-600">Operating Hours</p>
                  <p className="font-medium">
                    {order.deliveryPoint.operatingHours}
                  </p>
                </div>
              )}
              {order.deliveryPoint.contactInfo && (
                <>
                  {order.deliveryPoint.contactInfo.phone && (
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">
                        {order.deliveryPoint.contactInfo.phone}
                      </p>
                    </div>
                  )}
                  {order.deliveryPoint.contactInfo.email && (
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">
                        {order.deliveryPoint.contactInfo.email}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

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
              <OrderTimeline status={order.status} />
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
                <OrderProduct
                  key={item.product?._id || index}
                  item={item}
                  index={index}
                />
              ))}

              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount{order.discountCode && ` (${order.discountCode})`}
                    </span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({(order.taxRate * 100).toFixed(1)}%)</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
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

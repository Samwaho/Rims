"use client";

import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { axiosHeaders } from "@/lib/actions";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, AlertCircle, Eye, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { memo } from "react";

interface OrderProduct {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
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
  status:
    | "pending"
    | "order_submitted"
    | "processing"
    | "in_transit"
    | "shipped"
    | "under_clearance"
    | "out_for_delivery"
    | "delivered";
  orderDate: string;
  paymentMethod: "mpesa" | "bank";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentDetails?: any;
  shippingDetails: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    countryCode: string;
    contactNumber: string;
  };
  statusHistory?: Array<{
    status: string;
    note?: string;
    timestamp: string;
  }>;
  deliveryPoint?: {
    name: string;
  };
}

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  order_submitted: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border border-blue-200",
  in_transit: "bg-orange-100 text-orange-800 border border-orange-200",
  shipped: "bg-purple-100 text-purple-800 border border-purple-200",
  under_clearance: "bg-indigo-100 text-indigo-800 border border-indigo-200",
  out_for_delivery: "bg-teal-100 text-teal-800 border border-teal-200",
  delivered: "bg-green-100 text-green-800 border border-green-200",
} as const;

const paymentStatusStyles = {
  completed: "bg-green-100 text-green-800 border border-green-200",
  failed: "bg-red-100 text-red-800 border border-red-200",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
} as const;

const OrderStatusBadge = memo(({ status }: { status: string }) => {
  const displayStatus =
    status === "pending"
      ? "Order Submitted"
      : status
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

  return (
    <div
      className={`px-2.5 py-1.5 text-xs sm:text-sm rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
        statusStyles[status as keyof typeof statusStyles] ||
        statusStyles.processing
      }`}
    >
      {displayStatus}
    </div>
  );
});
OrderStatusBadge.displayName = "OrderStatusBadge";

const PaymentStatusBadge = memo(({ status }: { status: string }) => (
  <div
    className={`px-2.5 py-1.5 text-xs sm:text-sm rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
      paymentStatusStyles[status as keyof typeof paymentStatusStyles] ||
      paymentStatusStyles.pending
    }`}
  >
    <span className="hidden sm:inline">Payment: </span>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </div>
));
PaymentStatusBadge.displayName = "PaymentStatusBadge";

const EmptyOrdersCard = memo(() => (
  <Card className="border-2 border-dashed">
    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
      <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mb-4 sm:mb-6 animate-bounce" />
      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3">
        No Orders Yet
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-6 text-center max-w-md">
        Your order history is empty. Start shopping to create your first order
        and track your purchases!
      </p>
      <Link href="/products">
        <Button
          size="lg"
          className="bg-primary hover:opacity-80 text-white transition-all duration-200 transform hover:scale-105"
        >
          Start Shopping
        </Button>
      </Link>
    </CardContent>
  </Card>
));
EmptyOrdersCard.displayName = "EmptyOrdersCard";

const OrderCard = memo(({ order }: { order: Order }) => {
  const displayStatus =
    order.status === "pending" ? "order_submitted" : order.status;

  return (
    <Link href={`/orders/${order._id}`} className="block">
      <Card className="hover:shadow-lg transition-all duration-300 border-gray-200/80 cursor-pointer">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
            <div>
              <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                Order #{order._id.slice(-8)}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Placed on {formatDate(order.orderDate)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <OrderStatusBadge status={displayStatus} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1.5 text-sm sm:text-base text-gray-600 flex-1">
              <div className="font-medium">
                {order.products.length} item
                {order.products.length !== 1 ? "s" : ""}
              </div>
              {order.shippingDetails ? (
                <div className="space-y-0.5">
                  <div className="text-gray-500 flex items-start gap-1">
                    <span className="font-medium">Delivery to:</span>
                    {order.shippingDetails.addressLine1}, {order.shippingDetails.city}, {order.shippingDetails.state}, {order.shippingDetails.country}
                  </div>
                  {order.shippingDetails.addressLine2 && (
                    <div className="text-gray-500 pl-[72px]">
                      {order.shippingDetails.addressLine2}
                    </div>
                  )}
                </div>
              ) : order.deliveryPoint ? (
                <div className="text-gray-500 flex items-center gap-1">
                  <span className="font-medium">Delivery Point:</span>
                  {order.deliveryPoint.name}
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6">
              <div className="flex flex-col items-end">
                <div className="text-base sm:text-lg font-bold text-gray-900">
                  {formatPrice(order.total)}
                </div>
                {order.discount > 0 && (
                  <div className="text-xs sm:text-sm font-medium text-green-600">
                    Saved {formatPrice(order.discount)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                View Details
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
OrderCard.displayName = "OrderCard";

export default function OrdersPage() {
  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery<Order[], AxiosError>({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/user-orders`,
        await axiosHeaders()
      );
      return response.data.orders;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (error) {
    return (
      <div className="min-h-[80vh] bg-gray-50 py-6 sm:py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-100">
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mb-4 sm:mb-6 animate-pulse" />
              <h3 className="text-xl sm:text-2xl font-semibold text-red-600 mb-3">
                Failed to Load Orders
              </h3>
              <p className="text-base text-gray-600 mb-6 text-center max-w-md">
                We encountered an error while loading your orders. Please try
                again later.
              </p>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] bg-gray-50 py-6 sm:py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 sm:h-40 bg-gray-200 rounded-lg shadow-sm"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">
              My Orders
            </h1>
            <Link href="/products">
              <Button
                variant="outline"
                className="hidden sm:flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {orders.length === 0 ? (
            <EmptyOrdersCard />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/80">
              <div className="space-y-4 sm:space-y-5 p-4 sm:p-6">
                {orders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
import { Package, AlertCircle, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OrderProduct {
  product: {
    name: string;
    price: number;
    images: string[];
    slug: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  products: OrderProduct[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  paymentStatus: "pending" | "completed" | "failed";
  paymentMethod: "mpesa" | "bank";
  shippingInfo?: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
    updatedAt?: string;
  };
}

const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
  };

  return (
    <div
      className={`px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm rounded-full font-medium whitespace-nowrap ${
        statusStyles[status as keyof typeof statusStyles] ||
        statusStyles.processing
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div
      className={`px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm rounded-full font-medium whitespace-nowrap ${
        statusStyles[status as keyof typeof statusStyles] ||
        statusStyles.pending
      }`}
    >
      <span className="hidden sm:inline">Payment: </span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};

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
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-4 sm:p-6">
            <CardContent className="flex flex-col items-center justify-center py-4 sm:py-6">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-red-600 mb-2">
                Failed to load orders
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 text-center">
                Please try again later
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 sm:h-32 bg-gray-200 rounded shadow-sm"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            My Orders
          </h1>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-2">
                No orders yet
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4 text-center">
                Your order history is empty. Start shopping to create your first
                order!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-3 sm:px-4 py-2 bg-red-600 text-white text-sm sm:text-base rounded-md hover:bg-red-700 transition-colors"
              >
                Browse Products
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
              {orders.map((order) => (
                <Card
                  key={order._id}
                  className="hover:shadow-md transition-all duration-200"
                >
                  <CardHeader className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between sm:items-start">
                      <div>
                        <CardTitle className="text-base sm:text-lg">
                          Order #{order._id.slice(-8)}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {formatDate(new Date(order.orderDate))}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <OrderStatusBadge status={order.status} />
                        {order.paymentStatus && (
                          <PaymentStatusBadge status={order.paymentStatus} />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                      <div className="text-xs sm:text-sm text-gray-600">
                        {order.products.length} items
                        {order.shippingInfo?.trackingNumber && (
                          <span className="block sm:inline sm:ml-2">
                            • Tracking: {order.shippingInfo.trackingNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-4">
                        <div className="text-sm sm:text-base font-semibold">
                          {formatPrice(order.totalAmount)}
                        </div>
                        <Link href={`/orders/${order._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            View Order
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

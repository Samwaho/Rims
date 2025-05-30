"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { axiosHeaders, getAuthUser } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { createColumns } from "./columns";
import { DataTablePagination } from "@/components/ui/data-table/pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/view-options";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { useNewOrders } from "@/hooks/useNewOrders";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STALE_TIME = 1000 * 60 * 5; // 5 minutes

interface ErrorResponse {
  message: string;
}

interface OrderResponse {
  orders: Order[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };
}

const statusStyles = {
  delivered: "bg-green-100 text-green-800 border border-green-200",
  cancelled: "bg-red-100 text-red-800 border border-red-200",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border border-blue-200",
  in_transit: "bg-orange-100 text-orange-800 border border-orange-200",
  shipped: "bg-purple-100 text-purple-800 border border-purple-200",
} as const;

interface Order {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
  products: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      buyingPrice?: number;
      images: string[];
    };
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  deliveryCost: number;
  total: number;
  status: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: "pesapal";
  paymentDetails?: {
    pesapalTrackingId?: string;
  };
  viewed: boolean;
  orderDate: string;
  tax?: number;
}

interface TransformedOrder extends Order {
  user: Order["user"] & {
    name: string;
  };
  profit: number;
}

export default function AdminOrders() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const checkAuth = useCallback(async () => {
    try {
      const user = await getAuthUser();
      if (user?.role !== "admin") {
        router.push("/sign-in");
        return;
      }
      setIsAuthChecked(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/sign-in");
    }
  }, [router]);

  useEffect(() => {
    if (router) {
      checkAuth();
    }
  }, [router, checkAuth]);

  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    error,
    refetch,
  } = useQuery<Order[], AxiosError<ErrorResponse>>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await axios.get<OrderResponse>(
        `${BACKEND_URL}/api/orders/admin/all`,
        await axiosHeaders()
      );
      return data.orders;
    },
    retry: 1,
    staleTime: STALE_TIME,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    enabled: isAuthChecked,
  });

  const handleStatusUpdate = useCallback(
    async (orderId: string, newStatus: string) => {
      try {
        await axios.patch(
          `${BACKEND_URL}/api/orders/${orderId}/status`,
          { status: newStatus },
          await axiosHeaders()
        );
        toast.success("Order status updated successfully");
        refetch();
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || "Error updating order status"
            : "Error updating order status";

        toast.error(errorMessage);
        console.error("Error updating order status:", error);
      }
    },
    [refetch]
  );

  const handleCostUpdate = useCallback(
    async (orderId: string, field: string, value: number) => {
      try {
        await axios.patch(
          `${BACKEND_URL}/api/orders/${orderId}/costs`,
          { [field]: value },
          await axiosHeaders()
        );
        toast.success("Cost updated successfully");
        refetch();
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || "Error updating cost"
            : "Error updating cost";

        toast.error(errorMessage);
        console.error("Error updating cost:", error);
      }
    },
    [refetch]
  );

  const handleDeleteOrder = useCallback(
    async (orderId: string) => {
      try {
        await axios.delete(
          `${BACKEND_URL}/api/orders/${orderId}`,
          await axiosHeaders()
        );
        refetch(); // Refetch orders after deletion
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || "Error deleting order"
            : "Error deleting order";
        toast.error(errorMessage);
        console.error("Error deleting order:", error);
        throw error;
      }
    },
    [refetch]
  );

  const transformedOrders: TransformedOrder[] = useMemo(() => {
    return orders.map((order) => {
      const total = order.total;
      const productCost = order.products.reduce(
        (sum, item) => sum + (item.product?.buyingPrice || 0) * item.quantity,
        0
      );

      const totalCosts =
        productCost +
        (order.tax || 0) +
        (order.shippingCost || 0) +
        (order.deliveryCost || 0);

      const user = {
        ...order.user,
        name: `${order.user.firstName || ""} ${
          order.user.lastName || ""
        }`.trim(),
      };

      return {
        ...order,
        user,
        total,
        profit: total - totalCosts,
      };
    });
  }, [orders]);

  const columns = useMemo(
    () =>
      createColumns<TransformedOrder>({
        handleStatusUpdate,
        handleCostUpdate,
        handleDeleteOrder,
      }),
    [handleStatusUpdate, handleCostUpdate, handleDeleteOrder]
  );

  const table = useReactTable<TransformedOrder>({
    data: transformedOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      globalFilter: debouncedSearch,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const user = row.original.user;

      return (
        user.name.toLowerCase().includes(searchValue) ||
        user.username.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
      );
    },
  });

  const viewOptions = useMemo(
    () => <DataTableViewOptions table={table} />,
    [table]
  );

  const renderLoadingState = () => (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const renderErrorState = (errorMessage: string) => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Card className="p-6">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            Failed to load orders
          </h3>
          <p className="text-gray-600 mb-4 text-center">{errorMessage}</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg shadow-sm"></div>
        ))}
      </div>
    </div>
  );

  const { data: newOrdersCount = 0 } = useNewOrders();

  const queryClient = useQueryClient();

  const markOrdersAsViewed = async (orderIds: string[]) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/orders/mark-viewed`,
        { orderIds },
        await axiosHeaders()
      );

      // Invalidate the queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["new-orders-count"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (error) {
      console.error("Error marking orders as viewed:", error);
    }
  };

  const handleMarkAsViewed = () => {
    const unviewedOrders = orders
      .filter((order) => !order.viewed)
      .map((order) => order._id);

    if (unviewedOrders.length > 0) {
      markOrdersAsViewed(unviewedOrders);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh both the orders list and new orders count
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["new-orders-count"] });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [queryClient]);

  const checkPesapalStatus = async (orderId: string, trackingId: string) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/payments/pesapal/status/${trackingId}`,
        await axiosHeaders()
      );

      if (response.data.status === "COMPLETED") {
        // Update order status if payment is completed
        await axios.patch(
          `${BACKEND_URL}/api/orders/${orderId}/payment-status`,
          { status: "completed" },
          await axiosHeaders()
        );

        // Refetch orders to update the UI
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      }
    } catch (error) {
      console.error("Error checking Pesapal status:", error);
    }
  };

  const PesapalStatusCheck = memo(({ order }: { order: Order }) => {
    const [isChecking, setIsChecking] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const handleCheck = async () => {
      if (!order.paymentDetails?.pesapalTrackingId) return;

      if (lastChecked && Date.now() - lastChecked.getTime() < 10000) {
        toast.info("Please wait a few seconds before checking again");
        return;
      }

      setIsChecking(true);
      try {
        await checkPesapalStatus(
          order._id,
          order.paymentDetails.pesapalTrackingId
        );
        setLastChecked(new Date());
        toast.success("Payment status checked successfully");
      } catch (error) {
        toast.error("Failed to check payment status");
      } finally {
        setIsChecking(false);
      }
    };

    if (order.paymentStatus === "completed") return null;

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleCheck}
        disabled={isChecking || !order.paymentDetails?.pesapalTrackingId}
        className="ml-2"
      >
        {isChecking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Check Payment"
        )}
      </Button>
    );
  });
  PesapalStatusCheck.displayName = "PesapalStatusCheck";

  useEffect(() => {
    const checkPendingPayments = async () => {
      const pendingOrders = orders.filter(
        (order) =>
          order.paymentStatus === "pending" &&
          order.paymentDetails?.pesapalTrackingId
      );

      for (const order of pendingOrders) {
        if (order.paymentDetails?.pesapalTrackingId) {
          await checkPesapalStatus(
            order._id,
            order.paymentDetails.pesapalTrackingId
          );
        }
      }
    };

    const interval = setInterval(checkPendingPayments, 5 * 60 * 1000);

    if (orders.some((order) => order.paymentStatus === "pending")) {
      checkPendingPayments();
    }

    return () => clearInterval(interval);
  }, [orders]);

  if (!isAuthChecked) return renderLoadingState();

  if (error) {
    const errorMessage =
      (error as AxiosError<ErrorResponse>).response?.data?.message ||
      "Please try again later";
    return renderErrorState(errorMessage);
  }

  if (isOrdersLoading) return renderLoadingSkeleton();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          className="w-fit flex items-center gap-2 hover:bg-gray-100"
          onClick={() => router.push("/admin")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Order Management
            </h1>
            {newOrdersCount > 0 && (
              <>
                <div className="flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary text-primary-foreground">
                  {newOrdersCount} new
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAsViewed}
                  className="ml-2"
                >
                  Mark all as viewed
                </Button>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            {viewOptions}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                          {cell.column.id === "payment" && (
                            <PesapalStatusCheck order={row.original} />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <p className="text-gray-600 text-lg">No orders found.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination table={table} />
        </div>
      </div>
    </div>
  );
}

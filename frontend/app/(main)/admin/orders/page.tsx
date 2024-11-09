"use client";

import { useQuery } from "@tanstack/react-query";
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
import { Loader2, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { axiosHeaders, getAuthUser } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { createColumns, type Order } from "./columns";
import { DataTablePagination } from "@/components/ui/data-table/pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/view-options";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useMemo, useCallback } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STALE_TIME = 1000 * 60 * 5; // 5 minutes

interface ErrorResponse {
  message: string;
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
      const { data } = await axios.get(
        `${BACKEND_URL}/api/orders/admin/all`,
        await axiosHeaders()
      );
      return data.orders;
    },
    retry: 1,
    staleTime: STALE_TIME,
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

  const columns = useMemo(
    () => createColumns({ handleStatusUpdate }),
    [handleStatusUpdate]
  );

  const table = useReactTable({
    data: orders,
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
    globalFilterFn: "includesString",
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
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Order Management
          </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by customer..."
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

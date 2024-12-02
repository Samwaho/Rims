"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Loader2,
  ShoppingBag,
  Settings,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useProducts } from "@/hooks/useProducts";
import { getAuthUser, axiosHeaders } from "@/lib/actions";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { createColumns } from "./columns";
import { DataTablePagination } from "@/components/ui/data-table/pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/view-options";
import { Card } from "@/components/ui/card";
import { useNewOrders } from "@/hooks/useNewOrders";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AdminPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useProducts(debouncedSearch);

  const { data: newOrdersCount = 0 } = useNewOrders();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getAuthUser();
        if (!user) router.push("/sign-in");
      } catch (error) {
        router.push("/sign-in");
      }
    };
    checkAuth();
  }, [router]);

  const handleDelete = useCallback(
    async (productId: string) => {
      if (!confirm("Are you sure you want to delete this product?")) return;

      try {
        await axios.delete(
          `${BACKEND_URL}/api/products/${productId}`,
          await axiosHeaders()
        );
        toast.success("Product deleted successfully");
        refetch();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Error deleting product");
        console.error("Delete error:", error);
      }
    },
    [refetch]
  );

  const columns = useMemo(
    () => createColumns({ handleDelete }),
    [handleDelete]
  );

  const table = useReactTable({
    data: productsData?.pages?.[0]?.products || [],
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
    },
  });

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-600 font-medium">
            Error loading products. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-12">
            <div className="flex justify-center items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-gray-600 font-medium">
                Loading products...
              </span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!table.getRowModel().rows?.length) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-32 text-center">
            <p className="text-gray-500 font-medium">No products found.</p>
          </TableCell>
        </TableRow>
      );
    }

    return table.getRowModel().rows.map((row) => (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className="hover:bg-gray-50 transition-colors"
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className="py-4">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <DataTableViewOptions table={table} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/create">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Add Product</h3>
                  <p className="text-sm text-gray-500">Create new listing</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer relative">
              {newOrdersCount > 0 && (
                <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                  {newOrdersCount} new
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Orders</h3>
                  <p className="text-sm text-gray-500">Manage orders</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/financial">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">Financial</h3>
                  <p className="text-sm text-gray-500">Revenue analytics</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Settings</h3>
                  <p className="text-sm text-gray-500">Store configuration</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/products">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">View Store</h3>
                  <p className="text-sm text-gray-500">See customer view</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Users className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-medium">Users</h3>
                  <p className="text-sm text-gray-500">Manage users</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Products</h2>
          </div>
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
              <TableBody>{renderTableBody()}</TableBody>
            </Table>
          </div>
          <div className="border-t border-gray-100">
            <DataTablePagination table={table} />
          </div>
        </div>
      </div>
    </div>
  );
}

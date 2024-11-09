"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  images: string[];
  brand: string;
  madeIn: string;
  specifications: Array<{ name: string; value: string }>;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
};

interface ColumnProps {
  handleDelete: (productId: string) => Promise<void>;
}

export const createColumns = ({
  handleDelete,
}: ColumnProps): ColumnDef<Product>[] => [
  {
    accessorKey: "images",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => {
      return (
        <div className="relative w-20 h-20">
          <img
            src={row.original.images[0] || "/placeholder.png"}
            alt={row.original.name}
            className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-sm transition-transform hover:scale-105"
            loading="lazy"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Details" />
    ),
    cell: ({ row }) => {
      return (
        <div className="space-y-1.5 py-1">
          <p className="font-medium text-gray-900 line-clamp-2 text-sm sm:text-base">
            {row.original.name}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
            {row.original.brand}
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
            {row.original.category}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock & Price" />
    ),
    cell: ({ row }) => {
      const lowStock = row.original.stock < 10;
      return (
        <div className="space-y-1.5 py-1">
          <p className="font-medium text-sm sm:text-base">
            KES {row.original.price.toLocaleString()}
          </p>
          <p
            className={`text-xs sm:text-sm font-medium ${
              lowStock ? "text-red-500 animate-pulse" : "text-gray-500"
            }`}
          >
            {row.original.stock} in stock
            {lowStock && " (Low)"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "averageRating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stats" />
    ),
    cell: ({ row }) => {
      return (
        <div className="space-y-1.5 py-1">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 animate-pulse">★</span>
            <span className="text-sm sm:text-base font-medium">
              {row.original.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            {row.original.reviewCount.toLocaleString()} reviews
          </p>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Link href={`/admin/edit/${row.original._id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-600 transition-colors"
            onClick={() => handleDelete(row.original._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

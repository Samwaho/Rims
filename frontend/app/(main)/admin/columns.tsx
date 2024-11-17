"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CreateColumnsProps {
  handleDelete: (productId: string) => void;
}

export const createColumns = ({
  handleDelete,
}: CreateColumnsProps): ColumnDef<Product, any>[] => [
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => (
      <div className="relative h-12 w-12 sm:h-16 sm:w-16 overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
        <Image
          src={row.original.images[0] || "/placeholder.png"}
          alt={row.original.name}
          fill
          className="object-cover transition-transform duration-200 hover:scale-110"
          sizes="(max-width: 640px) 48px, 64px"
          priority
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="max-w-[200px] sm:max-w-none">
        <span className="font-medium text-gray-900 line-clamp-2 sm:line-clamp-1">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="font-semibold text-primary whitespace-nowrap">
        {formatPrice(row.original.price)}
      </span>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.original.stock;
      const isLowStock = stock < 10;
      const isOutOfStock = stock === 0;

      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2">
          <span className="font-medium">{stock}</span>
          {isOutOfStock ? (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
              Out of Stock
            </span>
          ) : (
            isLowStock && (
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                Low Stock
              </span>
            )
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href={`/admin/edit/${row.original._id}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors duration-200"
            title="Edit product"
          >
            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDelete(row.original._id)}
          className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors duration-200"
          title="Delete product"
        >
          <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    ),
  },
];

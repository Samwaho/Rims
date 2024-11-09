"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

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

// Memoized cell components for better performance
const ImageCell = memo(
  ({ imageUrl, name }: { imageUrl: string; name: string }) => (
    <div className="relative w-20 h-20">
      <img
        src={imageUrl || "/placeholder.png"}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-sm transition-transform hover:scale-105"
        loading="lazy"
      />
    </div>
  )
);
ImageCell.displayName = "ImageCell";

const ProductDetailsCell = memo(
  ({
    name,
    brand,
    category,
  }: {
    name: string;
    brand: string;
    category: string;
  }) => (
    <div className="space-y-1.5 py-1">
      <p className="font-medium text-gray-900 line-clamp-2 text-sm sm:text-base">
        {name}
      </p>
      <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{brand}</p>
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
        {category}
      </span>
    </div>
  )
);
ProductDetailsCell.displayName = "ProductDetailsCell";

const StockPriceCell = memo(
  ({ price, stock }: { price: number; stock: number }) => {
    const lowStock = stock < 10;
    return (
      <div className="space-y-1.5 py-1">
        <p className="font-medium text-sm sm:text-base">
          KES {price.toLocaleString()}
        </p>
        <p
          className={`text-xs sm:text-sm font-medium ${
            lowStock ? "text-red-500 animate-pulse" : "text-gray-500"
          }`}
        >
          {stock} in stock
          {lowStock && " (Low)"}
        </p>
      </div>
    );
  }
);
StockPriceCell.displayName = "StockPriceCell";

const StatsCell = memo(
  ({ rating, reviews }: { rating: number; reviews: number }) => (
    <div className="space-y-1.5 py-1">
      <div className="flex items-center gap-1.5">
        <span className="text-yellow-400 animate-pulse">★</span>
        <span className="text-sm sm:text-base font-medium">
          {rating.toFixed(1)}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-gray-500">
        {reviews.toLocaleString()} reviews
      </p>
    </div>
  )
);
StatsCell.displayName = "StatsCell";

const ActionButtons = memo(
  ({ id, onDelete }: { id: string; onDelete: () => void }) => (
    <div className="flex items-center gap-2">
      <Link href={`/admin/edit/${id}`}>
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
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
);
ActionButtons.displayName = "ActionButtons";

export const createColumns = ({
  handleDelete,
}: ColumnProps): ColumnDef<Product>[] => [
  {
    accessorKey: "images",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => (
      <ImageCell imageUrl={row.original.images[0]} name={row.original.name} />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Details" />
    ),
    cell: ({ row }) => (
      <ProductDetailsCell
        name={row.original.name}
        brand={row.original.brand}
        category={row.original.category}
      />
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock & Price" />
    ),
    cell: ({ row }) => (
      <StockPriceCell price={row.original.price} stock={row.original.stock} />
    ),
  },
  {
    accessorKey: "averageRating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stats" />
    ),
    cell: ({ row }) => (
      <StatsCell
        rating={row.original.averageRating}
        reviews={row.original.reviewCount}
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionButtons
        id={row.original._id}
        onDelete={() => handleDelete(row.original._id)}
      />
    ),
  },
];

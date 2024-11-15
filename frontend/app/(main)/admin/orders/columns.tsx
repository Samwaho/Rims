"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentStatusBadge } from "./components/PaymentStatusBadge";
import { memo } from "react";
import { formatDate, formatPrice } from "@/lib/utils";

export type Order = {
  _id: string;
  user: {
    username: string;
    email: string;
  };
  products: Array<{
    product: {
      name: string;
      price: number;
      images: string[];
    };
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  orderDate: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingInfo?: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
    updatedAt?: string;
  };
};

const STATUS_COLORS = {
  pending: "bg-yellow-500/90 hover:bg-yellow-500",
  processing: "bg-blue-500/90 hover:bg-blue-500",
  shipped: "bg-purple-500/90 hover:bg-purple-500",
  delivered: "bg-green-500/90 hover:bg-green-500",
  cancelled: "bg-primary/90 hover:bg-primary",
} as const;

const getStatusColor = (status: string): string => {
  return (
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
    "bg-gray-500/90 hover:bg-gray-500"
  );
};

interface ColumnProps {
  handleStatusUpdate: (orderId: string, newStatus: string) => Promise<void>;
}

// Memoized cell components
const CustomerCell = memo(({ user }: { user: Order["user"] }) => (
  <div className="space-y-1">
    <p className="font-medium text-sm truncate max-w-[150px] sm:max-w-none">
      {user.username}
    </p>
    <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-none">
      {user.email}
    </p>
  </div>
));
CustomerCell.displayName = "CustomerCell";

const ProductsCell = memo(({ products }: { products: Order["products"] }) => (
  <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-2">
    {products.map((item, index) => (
      <div key={index} className="text-sm flex items-center gap-1.5">
        <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
          {item.product?.name || "Deleted Product"}
        </span>
        <span className="text-muted-foreground whitespace-nowrap">
          × {item.quantity}
        </span>
      </div>
    ))}
  </div>
));
ProductsCell.displayName = "ProductsCell";

const StatusSelect = memo(
  ({
    status,
    orderId,
    onUpdate,
  }: {
    status: string;
    orderId: string;
    onUpdate: (orderId: string, value: string) => Promise<void>;
  }) => (
    <Select
      defaultValue={status}
      onValueChange={(value) => onUpdate(orderId, value)}
    >
      <SelectTrigger className="w-[110px] sm:w-[140px] h-8">
        <SelectValue placeholder="Update status" />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(STATUS_COLORS).map((status) => (
          <SelectItem key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
);
StatusSelect.displayName = "StatusSelect";

export const createColumns = ({
  handleStatusUpdate,
}: ColumnProps): ColumnDef<Order>[] => [
  {
    accessorKey: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => <CustomerCell user={row.original.user} />,
  },
  {
    accessorKey: "products",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Products" />
    ),
    cell: ({ row }) => <ProductsCell products={row.original.products} />,
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Amount" />
    ),
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {formatPrice(row.original.totalAmount || 0)}
      </div>
    ),
  },
  {
    accessorKey: "orderDate",
    header: "Date",
    cell: ({ row }) => {
      const date: string = row.getValue("orderDate");
      return <div className="font-medium">{formatDate(date)}</div>;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" />
    ),
    cell: ({ row }) => (
      <div className="space-y-1">
        <PaymentStatusBadge status={row.original.paymentStatus} />
        <div className="text-xs text-muted-foreground">
          {row.original.paymentMethod.toUpperCase()}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge
        className={`${getStatusColor(
          row.original.status
        )} text-white capitalize transition-colors duration-200`}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <StatusSelect
        status={row.original.status}
        orderId={row.original._id}
        onUpdate={handleStatusUpdate}
      />
    ),
  },
];

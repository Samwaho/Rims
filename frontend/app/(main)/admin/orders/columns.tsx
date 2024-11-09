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

const getStatusColor = (status: string) => {
  const colors = {
    pending:
      "bg-yellow-500/90 hover:bg-yellow-500 transition-colors duration-200",
    processing:
      "bg-blue-500/90 hover:bg-blue-500 transition-colors duration-200",
    shipped:
      "bg-purple-500/90 hover:bg-purple-500 transition-colors duration-200",
    delivered:
      "bg-green-500/90 hover:bg-green-500 transition-colors duration-200",
    cancelled: "bg-red-500/90 hover:bg-red-500 transition-colors duration-200",
  };
  return (
    colors[status as keyof typeof colors] ||
    "bg-gray-500/90 hover:bg-gray-500 transition-colors duration-200"
  );
};

interface ColumnProps {
  handleStatusUpdate: (orderId: string, newStatus: string) => Promise<void>;
}

interface OrderItem {
  product: {
    name: string;
    price: number;
  } | null;
  quantity: number;
}

export const createColumns = ({
  handleStatusUpdate,
}: ColumnProps): ColumnDef<Order>[] => [
  {
    accessorKey: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="space-y-1">
          <p className="font-medium text-sm truncate max-w-[150px] sm:max-w-none">
            {user.username}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-none">
            {user.email}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "products",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Products" />
    ),
    cell: ({ row }) => {
      const products = row.original.products;
      return (
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
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Amount" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium text-sm">
          KES {row.original.totalAmount.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "orderDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(row.original.orderDate).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" />
    ),
    cell: ({ row }) => {
      return (
        <div className="space-y-1">
          <PaymentStatusBadge status={row.original.paymentStatus} />
          <div className="text-xs text-muted-foreground">
            {row.original.paymentMethod.toUpperCase()}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          className={`${getStatusColor(
            row.original.status
          )} text-white capitalize`}
        >
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Select
          defaultValue={row.original.status}
          onValueChange={(value) => handleStatusUpdate(row.original._id, value)}
        >
          <SelectTrigger className="w-[110px] sm:w-[140px] h-8">
            <SelectValue placeholder="Update status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      );
    },
  },
];

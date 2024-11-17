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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  in_transit: "bg-orange-500/90 hover:bg-orange-500",
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
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <div className="space-y-1">
          <p className="font-medium text-sm truncate max-w-[120px] md:max-w-[180px] lg:max-w-[250px]">
            {user.username}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[120px] md:max-w-[180px] lg:max-w-[250px]">
            {user.email}
          </p>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <p className="font-medium">{user.username}</p>
          <p className="text-sm">{user.email}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));
CustomerCell.displayName = "CustomerCell";

const ProductsCell = memo(({ products }: { products: Order["products"] }) => (
  <ScrollArea className="h-[100px] w-full pr-4">
    <div className="space-y-2">
      {products.map((item, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger>
              <div className="text-sm flex items-center gap-2 p-1 rounded hover:bg-accent/50 transition-colors">
                <span className="font-medium truncate max-w-[120px] md:max-w-[180px] lg:max-w-[250px]">
                  {item.product?.name || "Deleted Product"}
                </span>
                <Badge variant="secondary" className="h-5 px-1.5">
                  {item.quantity}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.product?.name || "Deleted Product"}</p>
              <p className="text-sm text-muted-foreground">
                Quantity: {item.quantity}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  </ScrollArea>
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
      <SelectTrigger className="w-[130px] md:w-[150px] h-9">
        <SelectValue placeholder="Update status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="processing">Processing</SelectItem>
        <SelectItem value="in_transit">In Transit</SelectItem>
        <SelectItem value="shipped">Shipped</SelectItem>
        <SelectItem value="delivered">Delivered</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
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
      return (
        <div className="font-medium text-sm whitespace-nowrap">
          {formatDate(date)}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" />
    ),
    cell: ({ row }) => (
      <div className="space-y-1.5">
        <PaymentStatusBadge status={row.original.paymentStatus} />
        <div className="text-xs font-medium text-muted-foreground">
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
        )} text-white capitalize transition-colors duration-200 whitespace-nowrap`}
      >
        {row.original.status.replace("_", " ")}
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

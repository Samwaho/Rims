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
import { memo, useState, useRef, useEffect } from "react";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Loader2 } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export type Order = {
  _id: string;
  user: {
    username: string;
    email: string;
    name: string;
  };
  products: Array<{
    product: {
      name: string;
      price: number;
      buyingPrice: number;
      images: string[];
    };
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  deliveryCost: number;
  total: number;
  profit: number;
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
  order_submitted: "bg-yellow-500/90 hover:bg-yellow-500",
  processing: "bg-blue-500/90 hover:bg-blue-500",
  in_transit: "bg-orange-500/90 hover:bg-orange-500",
  shipped: "bg-purple-500/90 hover:bg-purple-500",
  under_clearance: "bg-indigo-500/90 hover:bg-indigo-500",
  out_for_delivery: "bg-teal-500/90 hover:bg-teal-500",
  delivered: "bg-green-500/90 hover:bg-green-500",
} as const;

const getStatusColor = (status: string): string => {
  return (
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
    "bg-gray-500/90 hover:bg-gray-500"
  );
};

interface ColumnProps {
  handleStatusUpdate: (orderId: string, newStatus: string) => Promise<void>;
  handleCostUpdate: (
    orderId: string,
    field: string,
    value: number
  ) => Promise<void>;
  handleDeleteOrder: (orderId: string) => Promise<void>;
}

// Memoized cell components
const CustomerCell = memo(
  ({ user, orderDate }: { user: Order["user"]; orderDate: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="space-y-1.5">
            <p className="font-medium text-sm truncate max-w-[120px] md:max-w-[180px] lg:max-w-[250px]">
              {user.name || user.username}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[120px] md:max-w-[180px] lg:max-w-[250px]">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(orderDate)}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{user.name || user.username}</p>
            <p className="text-sm">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              Ordered on: {formatDate(orderDate)}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
);
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
              <div className="space-y-1">
                <p>{item.product?.name || "Deleted Product"}</p>
                <p className="text-sm text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
              </div>
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
  }) => {
    const currentStatus = status === "pending" ? "order_submitted" : status;

    return (
      <Select
        defaultValue={currentStatus}
        onValueChange={(value) => onUpdate(orderId, value)}
      >
        <SelectTrigger className="w-[130px] md:w-[150px] h-9">
          <SelectValue placeholder="Update status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="order_submitted">Order Submitted</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="in_transit">In Transit</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="under_clearance">Under Clearance</SelectItem>
          <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
        </SelectContent>
      </Select>
    );
  }
);
StatusSelect.displayName = "StatusSelect";

// Separate PaymentInfo component
const PaymentInfo = memo(
  ({
    paymentStatus,
    paymentMethod,
  }: {
    paymentStatus: string;
    paymentMethod: string;
  }) => (
    <div className="space-y-1.5">
      <PaymentStatusBadge status={paymentStatus} />
      <div className="text-xs font-medium text-muted-foreground">
        {paymentMethod.toUpperCase()}
      </div>
    </div>
  )
);
PaymentInfo.displayName = "PaymentInfo";

// Update EditableCost component to show edit button
const EditableCost = memo(
  ({
    initialValue,
    orderId,
    field,
    onUpdate,
  }: {
    initialValue: number;
    orderId: string;
    field: "shippingCost" | "deliveryCost";
    onUpdate: (orderId: string, field: string, value: number) => Promise<void>;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      await onUpdate(orderId, field, numValue);
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        setValue(initialValue.toString());
      }
    };

    if (isEditing) {
      return (
        <form onSubmit={handleSubmit} className="flex items-center gap-1">
          <Input
            ref={inputRef}
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-20 h-7 text-sm"
            step="0.01"
            min="0"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                >
                  ✓
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save changes (Enter)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setIsEditing(false);
                    setValue(initialValue.toString());
                  }}
                >
                  ✕
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cancel (Esc)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </form>
      );
    }

    return (
      <div className="flex items-center justify-between gap-2">
        <span>{formatPrice(initialValue)}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    );
  }
);
EditableCost.displayName = "EditableCost";

// Add function to fetch tax rate
const fetchTaxRate = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/tax`,
      await axiosHeaders()
    );
    const taxConfigs = response.data;
    // Get the active tax configuration
    const activeTaxConfig = taxConfigs.find((config: any) => config.isActive);
    return activeTaxConfig?.rate || 16; // Default to 16% if no active config found
  } catch (error) {
    console.error("Error fetching tax rate:", error);
    return 16; // Default to 16% if there's an error
  }
};

// Update the tax calculation function to use dynamic rate
const calculateBusinessTax = (totalPaid: number, taxRate: number) => {
  const rate = taxRate / 100; // Convert percentage to decimal
  const netAmount = totalPaid / (1 + rate);
  return totalPaid - netAmount;
};

// Update FinancialDetails component to use dynamic tax rate
const FinancialDetails = memo(
  ({
    totalPaid,
    products,
    discount,
    shippingCost,
    deliveryCost,
    orderId,
    onCostUpdate,
  }: {
    totalPaid: number;
    products: Array<{
      product: {
        buyingPrice: number;
      };
      quantity: number;
    }>;
    discount: number;
    shippingCost: number;
    deliveryCost: number;
    orderId: string;
    onCostUpdate: (
      orderId: string,
      field: string,
      value: number
    ) => Promise<void>;
  }) => {
    const [taxRate, setTaxRate] = useState(16); // Default to 16% for admin view only

    // Fetch tax rate when component mounts
    useEffect(() => {
      const getTaxRate = async () => {
        const rate = await fetchTaxRate();
        setTaxRate(rate);
      };
      getTaxRate();
    }, []);

    const productCost = products.reduce(
      (sum, item) => sum + (item.product?.buyingPrice || 0) * item.quantity,
      0
    );

    // Calculate tax using dynamic rate
    const businessTax = calculateBusinessTax(totalPaid, taxRate);

    const totalCosts = productCost + shippingCost + deliveryCost;
    const profit = totalPaid - totalCosts - businessTax;

    return (
      <div className="space-y-2 min-w-[250px] p-2 rounded-lg border bg-card">
        <div className="grid grid-cols-2 gap-x-4 text-sm font-medium border-b pb-2">
          <span className="text-muted-foreground">Amount Paid:</span>
          <span className="text-primary">{formatPrice(totalPaid)}</span>
        </div>

        {discount > 0 && (
          <div className="grid grid-cols-2 gap-x-4 text-sm border-b pb-2">
            <span className="text-muted-foreground">Discount Applied:</span>
            <span className="text-red-500">-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="space-y-2 py-2">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Business Costs:
          </div>
          <div className="grid grid-cols-2 gap-x-4 text-sm pl-2">
            <span className="text-muted-foreground">
              Actual Buying Price (ABP):
            </span>
            <span className="font-medium">{formatPrice(productCost)}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 text-sm pl-2">
            <span className="text-muted-foreground">
              VAT ({taxRate}%):
              <HoverCard>
                <HoverCardTrigger>
                  <Info className="h-3 w-3 inline ml-1 text-muted-foreground" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">
                    VAT is calculated as {taxRate}% of the net amount (amount
                    before tax). For a tax-inclusive price, this is calculated
                    by dividing the total by {(1 + taxRate / 100).toFixed(2)} to
                    find the net amount, then subtracting that from the total.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </span>
            <span className="font-medium">{formatPrice(businessTax)}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 text-sm pl-2">
            <span className="text-muted-foreground">Shipping Cost:</span>
            <EditableCost
              initialValue={shippingCost}
              orderId={orderId}
              field="shippingCost"
              onUpdate={onCostUpdate}
            />
          </div>
          <div className="grid grid-cols-2 gap-x-4 text-sm pl-2">
            <span className="text-muted-foreground">Delivery Cost:</span>
            <EditableCost
              initialValue={deliveryCost}
              orderId={orderId}
              field="deliveryCost"
              onUpdate={onCostUpdate}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 text-sm border-t pt-2">
          <span className="text-muted-foreground">Total Costs:</span>
          <span className="font-medium text-red-500">
            -{formatPrice(totalCosts + businessTax)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 text-sm border-t pt-2 font-medium">
          <span className="text-muted-foreground">Net Profit:</span>
          <span
            className={`${
              profit < 0 ? "text-red-500" : "text-green-500"
            } font-semibold`}
          >
            {formatPrice(profit)}
          </span>
        </div>
      </div>
    );
  }
);
FinancialDetails.displayName = "FinancialDetails";

// Add DeleteOrderButton component
const DeleteOrderButton = memo(
  ({
    orderId,
    onDelete,
  }: {
    orderId: string;
    onDelete: (orderId: string) => Promise<void>;
  }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
      setIsDeleting(true);
      try {
        await onDelete(orderId);
        toast.success("Order deleted successfully");
      } catch (error) {
        toast.error("Failed to delete order");
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);
DeleteOrderButton.displayName = "DeleteOrderButton";

// Update the columns definition to include delivery information
export const createColumns = ({
  handleStatusUpdate,
  handleCostUpdate,
  handleDeleteOrder,
}: ColumnProps): ColumnDef<Order>[] => [
  {
    accessorKey: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer & Date" />
    ),
    cell: ({ row }) => (
      <CustomerCell
        user={row.original.user}
        orderDate={row.original.orderDate}
      />
    ),
  },
  {
    accessorKey: "products",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Products" />
    ),
    cell: ({ row }) => <ProductsCell products={row.original.products} />,
  },
  {
    id: "payment",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" />
    ),
    cell: ({ row }) => (
      <PaymentInfo
        paymentStatus={row.original.paymentStatus}
        paymentMethod={row.original.paymentMethod}
      />
    ),
  },
  {
    id: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-2">
        <Badge
          className={`${getStatusColor(
            row.original.status
          )} text-white capitalize w-fit transition-colors duration-200 whitespace-nowrap`}
        >
          {row.original.status.replace("_", " ")}
        </Badge>
        <StatusSelect
          status={row.original.status}
          orderId={row.original._id}
          onUpdate={handleStatusUpdate}
        />
      </div>
    ),
  },
  {
    id: "financial_details",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Financial Details" />
    ),
    cell: ({ row }) => (
      <FinancialDetails
        totalPaid={row.original.total}
        products={row.original.products}
        discount={row.original.discount || 0}
        shippingCost={row.original.shippingCost || 0}
        deliveryCost={row.original.deliveryCost || 0}
        orderId={row.original._id}
        onCostUpdate={handleCostUpdate}
      />
    ),
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DeleteOrderButton
          orderId={row.original._id}
          onDelete={handleDeleteOrder}
        />
      </div>
    ),
  },
];

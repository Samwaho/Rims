"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosHeaders } from "@/lib/actions";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface DiscountCode {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiryDate: string;
}

export function DiscountSettings() {
  const queryClient = useQueryClient();
  const [newDiscount, setNewDiscount] = useState({
    code: "",
    type: "percentage",
    value: "",
    minPurchase: "",
    maxUses: "",
    expiryDate: "",
  });

  const { data: discounts, isLoading } = useQuery({
    queryKey: ["discounts"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/discounts`,
        await axiosHeaders()
      );
      return data.discounts;
    },
  });

  const createDiscountMutation = useMutation({
    mutationFn: async (discountData: any) => {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/discounts`,
        discountData,
        await axiosHeaders()
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("Discount code created successfully");
      setNewDiscount({
        code: "",
        type: "percentage",
        value: "",
        minPurchase: "",
        maxUses: "",
        expiryDate: "",
      });
    },
    onError: () => {
      toast.error("Failed to create discount code");
    },
  });

  const deleteDiscountMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/discounts/${id}`,
        await axiosHeaders()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("Discount code deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete discount code");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscount.code || !newDiscount.value) {
      toast.error("Please fill in all required fields");
      return;
    }
    createDiscountMutation.mutate({
      ...newDiscount,
      value: parseFloat(newDiscount.value),
      minPurchase: parseFloat(newDiscount.minPurchase) || 0,
      maxUses: parseInt(newDiscount.maxUses) || null,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this discount code?")) {
      deleteDiscountMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Discount Codes</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={newDiscount.code}
              onChange={(e) =>
                setNewDiscount({ ...newDiscount, code: e.target.value })
              }
              placeholder="SUMMER2024"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={newDiscount.type}
              onValueChange={(value) =>
                setNewDiscount({ ...newDiscount, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              {newDiscount.type === "percentage" ? "Percentage" : "Amount"}
            </Label>
            <Input
              id="value"
              type="number"
              step={newDiscount.type === "percentage" ? "1" : "0.01"}
              value={newDiscount.value}
              onChange={(e) =>
                setNewDiscount({ ...newDiscount, value: e.target.value })
              }
              placeholder={newDiscount.type === "percentage" ? "10" : "1000"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minPurchase">Minimum Purchase (Optional)</Label>
            <Input
              id="minPurchase"
              type="number"
              step="0.01"
              value={newDiscount.minPurchase}
              onChange={(e) =>
                setNewDiscount({ ...newDiscount, minPurchase: e.target.value })
              }
              placeholder="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxUses">Maximum Uses (Optional)</Label>
            <Input
              id="maxUses"
              type="number"
              value={newDiscount.maxUses}
              onChange={(e) =>
                setNewDiscount({ ...newDiscount, maxUses: e.target.value })
              }
              placeholder="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={newDiscount.expiryDate}
              onChange={(e) =>
                setNewDiscount({ ...newDiscount, expiryDate: e.target.value })
              }
            />
          </div>

          <Button type="submit" className="col-span-2">
            <Plus className="w-4 h-4 mr-2" />
            Create Discount Code
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        {discounts?.map((discount: DiscountCode) => (
          <div
            key={discount._id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="space-y-1">
              <h3 className="font-medium">{discount.code}</h3>
              <p className="text-sm text-gray-500">
                {discount.type === "percentage"
                  ? `${discount.value}% off`
                  : `KES ${discount.value} off`}
              </p>
              <p className="text-xs text-gray-400">
                Used {discount.usedCount} times
                {discount.maxUses && ` (Max: ${discount.maxUses})`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Switch
                checked={discount.isActive}
                onCheckedChange={(checked) =>
                  // Add toggle mutation here
                  console.log("Toggle:", checked)
                }
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(discount._id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

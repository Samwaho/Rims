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
import { Loader2, Plus, Trash2, AlertCircle, Edit2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DiscountCode {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  endDate: string;
}

const formatDate = (dateString: string) => {
  try {
    console.log("Incoming date string:", dateString);

    if (!dateString) {
      return "No date set";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    return format(date, "PP");
  } catch (error) {
    console.error("Date formatting error:", error, "for date:", dateString);
    return "Invalid date";
  }
};

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
  const [editingDiscount, setEditingDiscount] = useState<any>(null);

  const { data: discounts, isLoading } = useQuery({
    queryKey: ["discounts"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/discounts`,
        await axiosHeaders()
      );
      console.log("API response discounts:", data.discounts);
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

  const toggleDiscountMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/discounts/${id}`,
        { isActive },
        await axiosHeaders()
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("Discount status updated successfully");
    },
    onError: (error: any) => {
      console.error("Error updating discount:", error);
      toast.error(
        error.response?.data?.message || "Failed to update discount status"
      );
    },
  });

  const editDiscountMutation = useMutation({
    mutationFn: async (discountData: any) => {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/discounts/${discountData._id}`,
        discountData,
        await axiosHeaders()
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("Discount updated successfully");
      setEditingDiscount(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update discount");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscount.code || !newDiscount.value || !newDiscount.expiryDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const discountData = {
      code: newDiscount.code.toUpperCase(),
      type: newDiscount.type,
      value: parseFloat(newDiscount.value),
      minPurchase: parseFloat(newDiscount.minPurchase) || 0,
      maxUses: parseInt(newDiscount.maxUses) || null,
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(newDiscount.expiryDate).toISOString(),
      usageLimit: parseInt(newDiscount.maxUses) || null,
      usedCount: 0,
    };

    createDiscountMutation.mutate(discountData);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this discount code?")) {
      deleteDiscountMutation.mutate(id);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingDiscount.code ||
      !editingDiscount.value ||
      !editingDiscount.endDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const discountData = {
      ...editingDiscount,
      value: parseFloat(editingDiscount.value),
      minPurchase: parseFloat(editingDiscount.minPurchase) || 0,
      maxUses: parseInt(editingDiscount.maxUses) || null,
      endDate: new Date(editingDiscount.endDate).toISOString(),
      usageLimit: parseInt(editingDiscount.maxUses) || null,
    };

    editDiscountMutation.mutate(discountData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discount Codes</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6 border rounded-lg bg-card"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={newDiscount.code}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, code: e.target.value })
                }
                placeholder="SUMMER2024"
                className="uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
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
                  <SelectItem value="percentage">Percentage Off</SelectItem>
                  <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">
                {newDiscount.type === "percentage"
                  ? "Percentage Off *"
                  : "Amount Off *"}
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
              <Label htmlFor="minPurchase">Minimum Purchase Amount</Label>
              <Input
                id="minPurchase"
                type="number"
                step="0.01"
                value={newDiscount.minPurchase}
                onChange={(e) =>
                  setNewDiscount({
                    ...newDiscount,
                    minPurchase: e.target.value,
                  })
                }
                placeholder="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUses">Maximum Number of Uses</Label>
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
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={newDiscount.expiryDate}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, expiryDate: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Fields marked with * are required
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={createDiscountMutation.isPending}
          >
            {createDiscountMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Create Discount Code
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        {discounts?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No discount codes found. Create one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discounts?.map((discount: DiscountCode) => (
              <div
                key={discount._id}
                className="p-6 border rounded-lg transition-colors"
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{discount.code}</h3>
                      <p className="text-sm text-muted-foreground">
                        {discount.type === "percentage"
                          ? `${discount.value}% off`
                          : `KES ${discount.value.toLocaleString()} off`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={discount.isActive}
                        onCheckedChange={(checked) =>
                          toggleDiscountMutation.mutate({
                            id: discount._id,
                            isActive: checked,
                          })
                        }
                      />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => setEditingDiscount(discount)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Discount</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleEditSubmit}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label>Code</Label>
                              <Input
                                value={editingDiscount?.code || ""}
                                onChange={(e) =>
                                  setEditingDiscount({
                                    ...editingDiscount,
                                    code: e.target.value,
                                  })
                                }
                                className="uppercase"
                                disabled
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select
                                value={editingDiscount?.type || "percentage"}
                                onValueChange={(value) =>
                                  setEditingDiscount({
                                    ...editingDiscount,
                                    type: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">
                                    Percentage Off
                                  </SelectItem>
                                  <SelectItem value="fixed">
                                    Fixed Amount Off
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Value</Label>
                              <Input
                                type="number"
                                value={editingDiscount?.value || ""}
                                onChange={(e) =>
                                  setEditingDiscount({
                                    ...editingDiscount,
                                    value: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Minimum Purchase</Label>
                              <Input
                                type="number"
                                value={editingDiscount?.minPurchase || ""}
                                onChange={(e) =>
                                  setEditingDiscount({
                                    ...editingDiscount,
                                    minPurchase: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Maximum Uses</Label>
                              <Input
                                type="number"
                                value={editingDiscount?.maxUses || ""}
                                onChange={(e) =>
                                  setEditingDiscount({
                                    ...editingDiscount,
                                    maxUses: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Expiry Date</Label>
                              <Input
                                type="date"
                                value={
                                  editingDiscount?.endDate?.split("T")[0] || ""
                                }
                                onChange={(e) =>
                                  setEditingDiscount({
                                    ...editingDiscount,
                                    endDate: e.target.value,
                                  })
                                }
                                min={new Date().toISOString().split("T")[0]}
                              />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingDiscount(null)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit">Save Changes</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(discount._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      Used {discount.usedCount} times
                      {discount.maxUses && ` of ${discount.maxUses}`}
                    </p>
                    {discount.minPurchase > 0 && (
                      <p>
                        Min. purchase: KES{" "}
                        {discount.minPurchase.toLocaleString()}
                      </p>
                    )}
                    <p>Expires: {formatDate(discount.endDate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

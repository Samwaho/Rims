"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { axiosHeaders } from "@/lib/actions";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
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

interface TaxConfig {
  _id: string;
  name: string;
  rate: number;
  isActive: boolean;
}

export function TaxSettings() {
  const queryClient = useQueryClient();
  const [newTax, setNewTax] = useState({ name: "", rate: "" });
  const [editingTax, setEditingTax] = useState<TaxConfig | null>(null);

  const { data: taxConfigs, isLoading } = useQuery({
    queryKey: ["taxConfigs"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tax`,
        await axiosHeaders()
      );
      return data;
    },
  });

  const createTaxMutation = useMutation({
    mutationFn: async (taxData: { name: string; rate: number }) => {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tax`,
        taxData,
        await axiosHeaders()
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxConfigs"] });
      toast.success("Tax configuration created successfully");
      setNewTax({ name: "", rate: "" });
    },
    onError: () => {
      toast.error("Failed to create tax configuration");
    },
  });

  const updateTaxMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TaxConfig>;
    }) => {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tax/${id}`,
        data,
        await axiosHeaders()
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxConfigs"] });
      toast.success("Tax configuration updated successfully");
    },
    onError: () => {
      toast.error("Failed to update tax configuration");
    },
  });

  const deleteTaxMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tax/${id}`,
        await axiosHeaders()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxConfigs"] });
      toast.success("Tax configuration deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete tax configuration");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTax.name || !newTax.rate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (editingTax) {
      updateTaxMutation.mutate({
        id: editingTax._id,
        data: {
          name: newTax.name,
          rate: parseFloat(newTax.rate),
        },
      });
      setEditingTax(null);
    } else {
      createTaxMutation.mutate({
        name: newTax.name,
        rate: parseFloat(newTax.rate),
      });
    }
  };

  const handleToggle = (id: string, isActive: boolean) => {
    updateTaxMutation.mutate({ id, data: { isActive } });
  };

  const handleEdit = (tax: TaxConfig) => {
    setEditingTax(tax);
    setNewTax({ name: tax.name, rate: tax.rate.toString() });
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
        <h2 className="text-xl font-semibold">Tax Configurations</h2>

        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="taxName">Tax Name</Label>
            <Input
              id="taxName"
              value={newTax.name}
              onChange={(e) => setNewTax({ ...newTax, name: e.target.value })}
              placeholder="e.g., VAT"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate">Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              value={newTax.rate}
              onChange={(e) => setNewTax({ ...newTax, rate: e.target.value })}
              placeholder="16"
            />
          </div>
          <Button type="submit" className="flex items-center gap-2">
            {editingTax ? (
              <>
                <Pencil className="w-4 h-4" />
                Update Tax
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Tax
              </>
            )}
          </Button>
          {editingTax && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingTax(null);
                setNewTax({ name: "", rate: "" });
              }}
            >
              Cancel
            </Button>
          )}
        </form>
      </div>

      <div className="space-y-4">
        {taxConfigs?.map((tax: TaxConfig) => (
          <div
            key={tax._id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{tax.name}</h3>
              <p className="text-sm text-gray-500">{tax.rate}%</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={tax.isActive}
                  onCheckedChange={(checked) => handleToggle(tax._id, checked)}
                />
                <span className="text-sm text-gray-500">
                  {tax.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(tax)}
                className="p-2"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete Tax Configuration
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this tax configuration?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteTaxMutation.mutate(tax._id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

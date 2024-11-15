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
import {
  Loader2,
  Plus,
  MapPin,
  Clock,
  Phone,
  Mail,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";

const deliveryPointSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  baseRate: z.number().min(0, "Base rate must be positive"),
  freeShippingThreshold: z.number().optional(),
  operatingHours: z.string().optional(),
  contactInfo: z
    .object({
      phone: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  isActive: z.boolean(),
});

type DeliveryPointFormValues = z.infer<typeof deliveryPointSchema>;

interface DeliveryPoint {
  _id: string;
  name: string;
  location: string;
  description?: string;
  baseRate: number;
  freeShippingThreshold?: number;
  isActive: boolean;
  operatingHours?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

export function ShippingSettings() {
  const queryClient = useQueryClient();
  const [editingPoint, setEditingPoint] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useForm<DeliveryPointFormValues>({
    defaultValues: {
      name: "",
      location: "",
      description: "",
      baseRate: 0,
      freeShippingThreshold: undefined,
      operatingHours: "",
      contactInfo: {
        phone: "",
        email: "",
      },
      isActive: true,
    },
  });

  const { data: deliveryPoints, isLoading } = useQuery({
    queryKey: ["deliveryPoints"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipping`,
        await axiosHeaders()
      );
      return data.deliveryPoints;
    },
  });

  const createPointMutation = useMutation({
    mutationFn: async (pointData: DeliveryPointFormValues) => {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipping`,
        pointData,
        await axiosHeaders()
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveryPoints"] });
      toast.success("Delivery point created successfully");
      form.reset();
      setShowAddForm(false);
    },
    onError: () => {
      toast.error("Failed to create delivery point");
    },
  });

  const updatePointMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<DeliveryPoint>;
    }) => {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipping/${id}`,
        data,
        await axiosHeaders()
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveryPoints"] });
      toast.success("Delivery point updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update delivery point"
      );
    },
  });

  const onSubmit = (data: DeliveryPointFormValues) => {
    createPointMutation.mutate(data);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updatePointMutation.mutateAsync({
        id,
        data: { isActive },
      });
      // Optimistically update the UI
      queryClient.setQueryData(["deliveryPoints"], (oldData: any) => {
        return oldData.map((point: DeliveryPoint) =>
          point._id === id ? { ...point, isActive } : point
        );
      });
    } catch (error) {
      console.error("Toggle error:", error);
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ["deliveryPoints"] });
    }
  };

  const handleEdit = (point: DeliveryPoint) => {
    setEditingPoint(point._id);
    form.reset({
      name: point.name,
      location: point.location,
      description: point.description,
      baseRate: point.baseRate,
      freeShippingThreshold: point.freeShippingThreshold,
      operatingHours: point.operatingHours,
      contactInfo: point.contactInfo,
      isActive: point.isActive,
    });
  };

  const handleSaveEdit = async (id: string) => {
    const values = form.getValues();
    try {
      await updatePointMutation.mutateAsync({
        id,
        data: values,
      });
      setEditingPoint(null);
    } catch (error) {
      console.error("Save edit error:", error);
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
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Delivery Points</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showAddForm ? "Cancel" : "Add Delivery Point"}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Add New Delivery Point</h3>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-2 gap-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Point Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., CBD Branch" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Moi Avenue, Next to KCB"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Additional details about the pickup point"
                          className="h-20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Fee (KES) *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="freeShippingThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Free Pickup Threshold
                        <HoverCard>
                          <HoverCardTrigger>
                            <span className="ml-1 text-gray-400 cursor-help">
                              ⓘ
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            Orders above this amount qualify for free pickup
                          </HoverCardContent>
                        </HoverCard>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="5000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operatingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Hours</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Mon-Fri: 9AM-5PM"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+254712345678" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="branch@example.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2 flex justify-end gap-2">
                  <Button type="submit" className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Delivery Point
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {deliveryPoints?.map((point: DeliveryPoint) => (
          <Card
            key={point._id}
            className={`${!point.isActive ? "opacity-75" : ""}`}
          >
            <CardContent className="pt-6">
              {editingPoint === point._id ? (
                <Form {...form}>
                  <form className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Point Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="baseRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Fee (KES) *</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="freeShippingThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Free Pickup Threshold</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="operatingHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operating Hours</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactInfo.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactInfo.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="col-span-2 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingPoint(null)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={() => handleSaveEdit(point._id)}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">{point.name}</h3>
                        <Badge
                          variant={point.isActive ? "default" : "secondary"}
                        >
                          {point.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {point.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(point)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Switch
                        checked={point.isActive}
                        onCheckedChange={(checked) =>
                          handleToggle(point._id, checked)
                        }
                        aria-label="Toggle delivery point status"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      {point.description && (
                        <p className="text-gray-600">{point.description}</p>
                      )}
                      <p className="font-medium mt-2">
                        Pickup Fee: KES {point.baseRate.toLocaleString()}
                      </p>
                      {point.freeShippingThreshold && (
                        <p className="text-green-600">
                          Free pickup over KES{" "}
                          {point.freeShippingThreshold.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      {point.operatingHours && (
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {point.operatingHours}
                        </div>
                      )}
                      {point.contactInfo?.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {point.contactInfo.phone}
                        </div>
                      )}
                      {point.contactInfo?.email && (
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {point.contactInfo.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

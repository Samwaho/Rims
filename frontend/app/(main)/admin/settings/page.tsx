"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { getAuthUser } from "@/lib/actions";
import { Loader2, ArrowLeft } from "lucide-react";
import { TaxSettings } from "./components/TaxSettings";
import { DiscountSettings } from "./components/DiscountSettings";
import { ShippingSettings } from "./components/ShippingSettings";
import { Button } from "@/components/ui/button";

export default function AdminSettings() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getAuthUser();
        if (!user || user.role !== "admin") {
          toast.error("Unauthorized access");
          router.push("/");
          return;
        }
      } catch (error) {
        toast.error("Authentication error occurred");
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Store Settings</h1>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="tax" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="tax">Tax</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="tax" className="space-y-4">
            <TaxSettings />
          </TabsContent>

          <TabsContent value="discounts" className="space-y-4">
            <DiscountSettings />
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <ShippingSettings />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

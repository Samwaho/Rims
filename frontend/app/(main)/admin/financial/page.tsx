"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthUser } from "@/lib/actions";
import { toast } from "sonner";
import { FinancialAnalytics } from "../components/FinancialAnalytics";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FinancialPage() {
  const router = useRouter();

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
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Financial Analytics
            </h1>
          </div>
        </div>

        <FinancialAnalytics />
      </div>
    </div>
  );
}

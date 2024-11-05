"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useProducts } from "@/hooks/useProducts";
import { getAuthUser, axiosHeaders } from "@/lib/actions";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  images: string[];
  brand: string;
  madeIn: string;
  specifications: Array<{ name: string; value: string }>;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

interface ProductsResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Use the custom hook for products
  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useProducts(debouncedSearch);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getAuthUser();
      if (!user) {
        router.push("/sign-in");
      }
    };
    checkAuth();
  }, [router]);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${productId}`,
        await axiosHeaders()
      );

      toast.success("Product deleted successfully");
      refetch(); // Refresh the products list after deletion
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error deleting product");
      console.error("Delete error:", error);
    }
  };

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">
          Error loading products. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Product Management
          </h1>
          <Link href="/admin/create">
            <Button className="flex items-center gap-2">
              <Plus size={20} />
              Add New Product
            </Button>
          </Link>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Stock & Price</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading products...
                      </div>
                    </td>
                  </tr>
                ) : productsData?.pages?.[0]?.products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  productsData?.pages?.[0]?.products.map((product: Product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <img
                          src={product.images[0] || "/placeholder.png"}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {product.brand}
                          </p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-medium">
                            KES {product.price.toLocaleString()}
                          </p>
                          <p
                            className={`text-sm ${
                              product.stock < 10
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {product.stock} in stock
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span>{product.averageRating.toFixed(1)}</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {product.reviewCount} reviews
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link href={`/admin/edit/${product._id}`}>
                            <Button variant="outline" size="sm">
                              <Pencil size={16} />
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(product._id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

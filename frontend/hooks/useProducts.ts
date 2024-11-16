import { useInfiniteQuery } from "@tanstack/react-query";
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

export function useProducts(search?: string) {
  return useInfiniteQuery<ProductsResponse>({
    queryKey: ["products", search],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("page", String(pageParam));

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await axios.get(url);
      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

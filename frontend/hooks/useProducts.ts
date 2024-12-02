import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/types/product";

export interface ProductsResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

interface UseProductsOptions {
  mode?: "infinite" | "pagination";
  page?: number;
  limit?: number;
}

export const useProducts = (
  searchTerm: string = "",
  options: UseProductsOptions = { mode: "infinite", limit: 12 }
) => {
  const { mode = "infinite", page = 1, limit = 12 } = options;

  // For infinite scroll (products page)
  if (mode === "infinite") {
    return useInfiniteQuery<ProductsResponse>({
      queryKey: ["products", searchTerm, "infinite"],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
          {
            params: {
              page: pageParam,
              limit,
              search: searchTerm,
            },
          }
        );
        return response.data;
      },
      getNextPageParam: (lastPage) =>
        lastPage.currentPage < lastPage.totalPages
          ? lastPage.currentPage + 1
          : undefined,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });
  }

  // For pagination (admin page)
  return useQuery<ProductsResponse>({
    queryKey: ["products", searchTerm, "pagination", page, limit],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
        {
          params: {
            page,
            limit,
            search: searchTerm,
          },
        }
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

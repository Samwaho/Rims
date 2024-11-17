import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/types/product";

interface ProductsResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

export const useProducts = (searchTerm: string = "") => {
  return useInfiniteQuery<ProductsResponse>({
    queryKey: ["products", searchTerm],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
        {
          params: {
            page: pageParam,
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
  });
};

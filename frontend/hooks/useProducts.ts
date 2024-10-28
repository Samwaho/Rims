import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/types/product";

const PRODUCTS_PER_PAGE = 12;

export const useProducts = (debouncedSearchTerm: string) => {
  return useInfiniteQuery({
    queryKey: ["products", debouncedSearchTerm],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
        {
          params: {
            page: pageParam,
            limit: PRODUCTS_PER_PAGE,
            search: debouncedSearchTerm,
          },
        }
      );
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.products.length === PRODUCTS_PER_PAGE &&
        allPages.length < lastPage.totalPages
        ? allPages.length + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 60000,
    retry: 2,
  });
};

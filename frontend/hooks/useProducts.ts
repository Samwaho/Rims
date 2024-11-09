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

export const useProducts = (search: string, category?: string) => {
  return useInfiniteQuery<ProductsResponse>({
    queryKey: ["products", search, category],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
        {
          params: {
            page: pageParam,
            search,
            category,
          },
        }
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
};

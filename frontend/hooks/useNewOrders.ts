"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useNewOrders = () => {
  return useQuery({
    queryKey: ["new-orders-count"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${BACKEND_URL}/api/orders/new/count`,
        await axiosHeaders()
      );
      return data.count;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

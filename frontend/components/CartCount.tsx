"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";

const fetchCartCount = async (): Promise<number> => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/count`,
    await axiosHeaders()
  );
  return response.data.count;
};

const CartCount = () => {
  const { data: count = 0 } = useQuery({
    queryKey: ["cartCount"],
    queryFn: fetchCartCount,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  if (count === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
      {count}
    </span>
  );
};

export default CartCount;

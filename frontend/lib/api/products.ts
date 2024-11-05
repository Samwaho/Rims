import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import { z } from "zod";
import { productSchema } from "@/lib/utils";

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  madeIn: string;
  images: string[];
  specifications: Array<{
    name: string;
    value: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export async function createProduct(
  data: ProductFormValues
): Promise<ProductResponse> {
  const response = await axios.post<ProductResponse>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
    data,
    await axiosHeaders()
  );
  return response.data;
}

export async function updateProduct(
  id: string,
  data: ProductFormValues
): Promise<ProductResponse> {
  const response = await axios.put<ProductResponse>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`,
    data,
    await axiosHeaders()
  );
  return response.data;
}

export async function getProduct(id: string): Promise<ProductResponse> {
  const response = await axios.get<ProductResponse>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`
  );
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await axios.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`,
    await axiosHeaders()
  );
}

export async function getAllProducts(): Promise<ProductResponse[]> {
  const response = await axios.get<ProductResponse[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`
  );
  return response.data;
}

import axios, { AxiosError } from "axios";
import { axiosHeaders } from "@/lib/actions";
import { z } from "zod";
import { productSchema } from "@/lib/utils";

// Types
export type ProductFormValues = z.infer<typeof productSchema>;

interface Specification {
  name: string;
  value: string;
}

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
  specifications: Specification[];
  createdAt: string;
  updatedAt: string;
}

// Constants
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`;
const DEFAULT_ERROR_MESSAGE = "An error occurred while processing your request";

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    throw new Error(error.response?.data?.message || DEFAULT_ERROR_MESSAGE);
  }
  throw error;
};

// API Functions
export async function createProduct(
  data: ProductFormValues
): Promise<ProductResponse> {
  try {
    const headers = await axiosHeaders();
    const response = await axios.post<ProductResponse>(
      API_BASE_URL,
      data,
      headers
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateProduct(
  id: string,
  data: ProductFormValues
): Promise<ProductResponse> {
  try {
    const headers = await axiosHeaders();
    const response = await axios.put<ProductResponse>(
      `${API_BASE_URL}/${id}`,
      data,
      headers
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getProduct(id: string): Promise<ProductResponse> {
  try {
    const response = await axios.get<ProductResponse>(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const headers = await axiosHeaders();
    await axios.delete(`${API_BASE_URL}/${id}`, headers);
  } catch (error) {
    handleApiError(error);
  }
}

export async function getAllProducts(): Promise<ProductResponse[]> {
  try {
    const response = await axios.get<ProductResponse[]>(API_BASE_URL);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

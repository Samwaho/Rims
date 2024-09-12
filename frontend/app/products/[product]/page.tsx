"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosHeaders } from "@/lib/actions";
import { toast } from "sonner";

interface Specification {
  name: string;
  value: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: "general" | "wheel" | "rim";
  brand: string;
  specifications: Specification[];
  createdAt: string;
  updatedAt: string;
}

async function getProduct(id: string): Promise<Product> {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/products/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
}

export default function ProductPage({
  params,
}: {
  params: { product: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      await axios.post(
        "http://localhost:3001/api/cart",
        { productId, quantity },
        await axiosHeaders()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Product added to cart");
    },
    onError: () => {
      toast.error("Failed to add product to cart");
    },
  });

  const handleAddToCart = () => {
    if (product) {
      addToCartMutation.mutate({ productId: product._id, quantity: 1 });
    }
  };

  React.useEffect(() => {
    setIsLoading(true);
    getProduct(params.product).then((data) => {
      setProduct(data);
      setIsLoading(false);
    });
  }, [params.product]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="flex space-x-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="w-20 h-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-2">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-6 w-full" />
              ))}
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
            <Separator />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-8">Error loading product</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Image
            src={product.images[selectedImageIndex]}
            alt={`${product.name} - Main Image`}
            width={600}
            height={600}
            className="w-full aspect-square object-cover rounded-lg"
          />
          <div className="flex flex-wrap gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`rounded-lg overflow-hidden transition-all ${
                  index === selectedImageIndex
                    ? "ring-2 ring-primary"
                    : "hover:ring-2 hover:ring-primary/50"
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image
                  src={image}
                  alt={`${product.name} - Image ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-20 h-20 object-cover"
                />
                <span className="sr-only">View Image {index + 1}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 ${
                    i < 3 ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">(12 reviews)</span>
          </div>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Brand:</span> {product.brand}
            </p>
            <p>
              <span className="font-semibold">Category:</span>{" "}
              {product.category}
            </p>
            <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
            <Badge
              variant="outline"
              className={`${
                product.stock > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>
          <p className="text-gray-600">{product.description}</p>
          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Product Specifications
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Specification</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.specifications.map((spec, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{spec.name}</TableCell>
                    <TableCell>{spec.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
        clipRule="evenodd"
      />
    </svg>
  );
}

"use client";

import React, { useState, useEffect } from "react";
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { axiosHeaders, getAuthUser } from "@/lib/actions";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

const sampleReviews: Review[] = [
  {
    id: 1,
    author: "John Doe",
    rating: 5,
    comment: "Excellent product! Fits perfectly on my car.",
    date: "2023-03-15",
  },
  {
    id: 2,
    author: "Jane Smith",
    rating: 4,
    comment: "Good quality, but shipping took longer than expected.",
    date: "2023-02-28",
  },
  {
    id: 3,
    author: "Mike Johnson",
    rating: 5,
    comment: "These wheels look amazing on my vehicle. Highly recommended!",
    date: "2023-04-02",
  },
];

const fetchProduct = async (id: string): Promise<Product> => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`
  );
  return response.data;
};

export default function ProductPage({
  params,
}: {
  params: { product: string };
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Add state for authentication status
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if the user is authenticated (this is just a placeholder, replace with actual auth check)
    const checkAuth = async () => {
      const response = await getAuthUser();
      // Set the authentication status based on the response from getAuthUser.
      // If the response exists and has data, set isAuthenticated to true.
      // Otherwise, set it to false.
      setIsAuthenticated(!!response && !!response.data);
    };
    checkAuth();
  }, []);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product>({
    queryKey: ["product", params.product],
    queryFn: () => fetchProduct(params.product),
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`,
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
    if (!isAuthenticated) {
      window.location.href = "/sign-in"; // Redirect to sign-in page if not authenticated
      return;
    }

    if (product) {
      addToCartMutation.mutate({ productId: product._id, quantity: 1 });
    }
  };

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return <div className="text-center py-8">Error loading product</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <ProductImages
          product={product}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
        />
        <ProductDetails product={product} handleAddToCart={handleAddToCart} />
      </div>
      <Separator className="my-8" />
      <div className="lg:hidden">
        <ProductReviews reviews={sampleReviews} />
      </div>
    </div>
  );
}

const ProductImages = ({
  product,
  selectedImageIndex,
  setSelectedImageIndex,
}: {
  product: Product;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
}) => (
  <div className="space-y-4">
    <div className="aspect-square w-full max-w-[500px]">
      <Image
        src={product.images[selectedImageIndex]}
        alt={`${product.name} - Main Image`}
        width={500}
        height={500}
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
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
            width={80}
            height={80}
            className="w-16 h-16 object-cover"
          />
          <span className="sr-only">View Image {index + 1}</span>
        </button>
      ))}
    </div>
    <div className="pt-8 hidden lg:block">
      <ProductReviews reviews={sampleReviews} />
    </div>
  </div>
);

const ProductDetails = ({
  product,
  handleAddToCart,
}: {
  product: Product;
  handleAddToCart: () => void;
}) => (
  <div className="space-y-4">
    <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>
    <ProductRating rating={3} reviewCount={12} />
    <ProductInfo product={product} />
    <p className="text-gray-600 text-sm lg:text-base">{product.description}</p>
    <Button
      size="lg"
      className="w-full bg-primary text-primary-foreground transition-colors duration-300"
      onClick={handleAddToCart}
      disabled={product.stock === 0}
    >
      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
    </Button>
    <Separator />
    <ProductSpecifications specifications={product.specifications} />
  </div>
);

const ProductRating = ({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) => (
  <div className="flex items-center space-x-4">
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
    <span className="text-xs lg:text-sm text-gray-500">
      ({reviewCount} reviews)
    </span>
  </div>
);

const ProductInfo = ({ product }: { product: Product }) => (
  <div className="space-y-2 text-sm lg:text-base">
    <p>
      <span className="font-semibold">Brand:</span> {product.brand}
    </p>
    <p>
      <span className="font-semibold">Category:</span> {product.category}
    </p>
    <p className="text-2xl lg:text-3xl font-bold">
      {formatPrice(product.price)}
    </p>
    <Badge
      variant="outline"
      className={
        product.stock > 0
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }
    >
      {product.stock > 0 ? "In Stock" : "Out of Stock"}
    </Badge>
  </div>
);

const ProductSpecifications = ({
  specifications,
}: {
  specifications: Specification[];
}) => (
  <div>
    <h2 className="text-lg lg:text-xl font-semibold mb-4">
      Product Specifications
    </h2>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-sm lg:text-base">Specification</TableHead>
          <TableHead className="text-sm lg:text-base">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {specifications.map((spec, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium text-sm lg:text-base">
              {spec.name}
            </TableCell>
            <TableCell className="text-sm lg:text-base">{spec.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const ProductReviews = ({ reviews }: { reviews: Review[] }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="flex space-x-4">
          <Avatar>
            <AvatarFallback>{review.author[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{review.author}</h3>
              <span className="text-sm text-gray-500">{review.date}</span>
            </div>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-gray-600">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProductSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton className="w-full aspect-square rounded-lg" />
        <div className="flex space-x-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="w-16 h-16 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="space-y-2">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-5 w-full" />
          ))}
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-full" />
        <Separator />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </div>
);

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

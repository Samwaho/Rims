"use client";
import React, { memo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuthUser } from "@/lib/actions";
import { toast } from "sonner";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Pick<
    Product,
    "_id" | "name" | "brand" | "madeIn" | "category" | "price" | "images"
  >;
  onAddToCart: () => void;
}

const ProductCardComponent = ({ product, onAddToCart }: ProductCardProps) => {
  const router = useRouter();

  const handleAuthAction = useCallback(
    async (action: () => void) => {
      const user = await getAuthUser();
      if (!user) {
        toast.error("Please sign in to continue");
        router.push("/sign-in");
        return;
      }
      action();
    },
    [router]
  );

  const handleBuyNow = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleAuthAction(() => router.push(`/checkout?productId=${product._id}`));
    },
    [handleAuthAction, product._id, router]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleAuthAction(() => onAddToCart());
    },
    [handleAuthAction, onAddToCart]
  );

  return (
    <div className="group bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <Link href={`/products/${product._id}`} className="block relative">
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
        <div className="p-3 sm:p-4">
          <div className="mb-2 sm:mb-3">
            <span className="text-lg sm:text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base sm:text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Made in</span> •{" "}
              {product.madeIn}
            </p>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-2">
        <Button
          size="sm"
          variant="outline"
          className="w-full transition-all duration-300 bg-gray-100 hover:bg-primary hover:text-primary-foreground group"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
        <Button
          size="sm"
          className="w-full bg-primary text-primary-foreground transition-all duration-300 hover:brightness-110"
          onClick={handleBuyNow}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Buy Now
        </Button>
      </div>
    </div>
  );
};

const ProductCardSkeleton = memo(() => (
  <div className="bg-background rounded-lg overflow-hidden shadow-sm border border-gray-100">
    <Skeleton className="w-full h-48" />
    <div className="p-4">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
    </div>
    <div className="px-4 pb-4 space-y-2">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  </div>
));

ProductCardSkeleton.displayName = "ProductCardSkeleton";

interface ProductCardType extends React.FC<ProductCardProps> {
  Skeleton: typeof ProductCardSkeleton;
}

const ProductCard = memo(ProductCardComponent) as unknown as ProductCardType;
ProductCard.Skeleton = ProductCardSkeleton;
ProductCard.displayName = "ProductCard";

export { ProductCard };

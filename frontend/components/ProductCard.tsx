"use client";
import React, { memo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, CreditCard, Tag, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuthUser } from "@/lib/actions";
import { toast } from "sonner";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Pick<
    Product,
    | "_id"
    | "name"
    | "size"
    | "madeIn"
    | "category"
    | "price"
    | "images"
    | "deliveryTime"
    | "condition"
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
    <div className="group bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-primary/20">
      <Link href={`/products/${product._id}`} className="block relative">
        <div className="relative w-full h-40 sm:h-52 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            priority
          />
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-center p-1.5 sm:p-2.5 bg-gray-100 rounded-xl w-fit mb-2 sm:mb-3 relative backdrop-blur-sm">
            <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-foreground" />
            <div className="flex flex-col">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-foreground tracking-tight">
                {formatPrice(product.price)}
              </p>
              <span className="text-[8px] sm:text-[10px] lg:text-xs text-foreground/80">
                Price for a set of 4 pieces
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <h3 className="text-sm sm:text-base font-bold line-clamp-1 group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
            <p className="text-sm sm:text-base font-semibold w-full">
              Size: {product.size}
            </p>
            <div className="flex items-center gap-2">
              {product.condition && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {product.condition === "new" ? "New" : "Slightly Used"}
                </span>
              )}
            </div>
            {product.madeIn && (
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                <span className="font-medium text-foreground">Origin</span>
                <span className="inline-flex items-center">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/40 mr-1.5 sm:mr-2"></span>
                  {product.madeIn}
                </span>
              </p>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
              <span>Delivery: {product.deliveryTime}</span>
            </p>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-2">
        <Button
          size="sm"
          variant="outline"
          className="w-full h-8 sm:h-10 text-xs sm:text-sm transition-all duration-300 bg-gray-50 hover:bg-primary hover:text-primary-foreground group border-gray-200 hover:border-primary"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 transition-transform group-hover:scale-110" />
          Add to Cart
        </Button>
        <Button
          size="sm"
          className="w-full h-8 sm:h-10 text-xs sm:text-sm bg-primary text-primary-foreground transition-all duration-300 hover:brightness-110 hover:scale-[1.02]"
          onClick={handleBuyNow}
        >
          <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 transition-transform group-hover:scale-110" />
          Buy Now
        </Button>
      </div>
    </div>
  );
};

const ProductCardSkeleton = memo(() => (
  <div className="bg-background rounded-lg overflow-hidden shadow-sm border border-gray-200 animate-pulse">
    <Skeleton className="w-full h-40 sm:h-52" />
    <div className="p-3 sm:p-4">
      <Skeleton className="h-8 sm:h-12 w-1/3 mb-3 sm:mb-4 rounded-lg" />
      <Skeleton className="h-5 sm:h-7 w-3/4 mb-2 rounded-md" />
      <Skeleton className="h-4 sm:h-5 w-1/2 mb-3 sm:mb-4 rounded-md" />
    </div>
    <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-2">
      <Skeleton className="h-8 sm:h-10 w-full rounded-md" />
      <Skeleton className="h-8 sm:h-10 w-full rounded-md" />
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

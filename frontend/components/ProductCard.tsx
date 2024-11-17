"use client";
import React, { memo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, CreditCard, Tag } from "lucide-react";
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
    <div className="group bg-background rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/20">
      <Link href={`/products/${product._id}`} className="block relative">
        <div className="relative w-full h-52 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center p-2 sm:p-3 bg-primary/5 rounded-2xl w-fit mb-3 sm:mb-4 relative backdrop-blur-sm">
            <Tag className="w-4 h-4 mr-2 text-primary" />
            <div className="flex flex-col">
              <p className="text-base sm:text-lg lg:text-xl font-bold text-primary tracking-tight">
                {formatPrice(product.price)}
              </p>
              <span className="text-[10px] sm:text-xs text-primary/80">
                Price for 4 pieces
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-base sm:text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="font-medium text-foreground">Made in</span>
              <span className="inline-flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></span>
                {product.madeIn}
              </span>
            </p>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-2.5">
        <Button
          size="sm"
          variant="outline"
          className="w-full h-10 transition-all duration-300 bg-gray-50 hover:bg-primary hover:text-primary-foreground group border-gray-200 hover:border-primary"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2.5 transition-transform group-hover:scale-110" />
          Add to Cart
        </Button>
        <Button
          size="sm"
          className="w-full h-10 bg-primary text-primary-foreground transition-all duration-300 hover:brightness-110 hover:scale-[1.02]"
          onClick={handleBuyNow}
        >
          <CreditCard className="w-4 h-4 mr-2.5 transition-transform group-hover:scale-110" />
          Buy Now
        </Button>
      </div>
    </div>
  );
};

const ProductCardSkeleton = memo(() => (
  <div className="bg-background rounded-xl overflow-hidden shadow-md border border-gray-200 animate-pulse">
    <Skeleton className="w-full h-52" />
    <div className="p-5">
      <Skeleton className="h-12 w-1/3 mb-4 rounded-xl" />
      <Skeleton className="h-7 w-3/4 mb-2 rounded-lg" />
      <Skeleton className="h-5 w-1/2 mb-4 rounded-lg" />
    </div>
    <div className="px-5 pb-5 space-y-2.5">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
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

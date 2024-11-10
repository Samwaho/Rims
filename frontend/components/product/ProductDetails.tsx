"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { ProductRating } from "./ProductRating";
import { ProductSpecifications } from "./ProductSpecifications";
import { useRouter } from "next/navigation";
import { getAuthUser } from "@/lib/actions";
import { toast } from "sonner";
import { ShoppingCart, CreditCard } from "lucide-react";

interface ProductDetailsProps {
  product: Product;
  handleAddToCart: () => void;
  handleBuyNow: () => void;
}

export default function ProductDetails({
  product,
  handleAddToCart,
  handleBuyNow,
}: ProductDetailsProps) {
  const router = useRouter();

  const handleAuthAction = async (action: () => void) => {
    const user = await getAuthUser();
    if (!user) {
      toast.error("Please sign in to continue");
      router.push("/sign-in");
      return;
    }
    action();
  };

  // Calculate average rating here to ensure consistency
  const averageRating = product.reviews?.length
    ? Number(
        (
          product.reviews.reduce((acc, review) => acc + review.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>
          <Badge
            variant="outline"
            className={`ml-2 ${
              product.stock > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-8 text-sm lg:text-base">
          <div>
            <span className="font-semibold">Brand:</span> {product.brand}
          </div>
          <div>
            <span className="font-semibold">Made in:</span> {product.madeIn}
          </div>
        </div>
        <p className="text-3xl lg:text-4xl font-bold text-primary">
          {formatPrice(product.price)}
        </p>
      </div>

      <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
        {product.description}
      </p>
      <div className="flex items-center gap-4">
        <ProductRating
          rating={averageRating}
          reviewCount={product.reviews?.length || 0}
        />
      </div>
      <div className="space-y-2">
        <Button
          onClick={handleAddToCart}
          variant="outline"
          className="w-full transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
          size="lg"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart
        </Button>
        <Button
          onClick={handleBuyNow}
          className="w-full bg-primary text-primary-foreground transition-all duration-300 hover:brightness-110"
          size="lg"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Buy Now
        </Button>
      </div>

      <Separator className="my-2" />

      <ProductSpecifications specifications={product.specifications} />
    </div>
  );
}

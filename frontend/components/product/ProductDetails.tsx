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
import {
  ShoppingCart,
  CreditCard,
  Tag,
  Share2,
  Truck,
  Clock,
} from "lucide-react";

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

  const handleShare = () => {
    const productUrl = window.location.href;
    navigator.clipboard.writeText(productUrl);
    toast.success("Product link copied to clipboard!");
  };

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

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-8 text-sm lg:text-base">
          <div>
            <span className="font-semibold">Size:</span> {product.size}
          </div>
          <div>
            <span className="font-semibold">Made in:</span> {product.madeIn}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Truck className="w-4 h-4" />
            <span>Shipping: {formatPrice(product.shippingCost)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Delivery Time: {product.deliveryTime}</span>
          </div>
        </div>
        {/* Price and Shipping Information */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center p-2.5 sm:p-4 bg-gray-200 rounded-xl w-fit relative backdrop-blur-sm">
            <Tag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-foreground" />
            <div className="flex flex-col">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                {formatPrice(product.price)}
              </p>
              <span className="text-[10px] sm:text-xs lg:text-sm text-foreground/80">
                Price for 4 pieces
              </span>
            </div>
          </div>
        </div>
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
      <div className="flex flex-col gap-4">
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
        <Button
          onClick={handleShare}
          variant="ghost"
          className="w-fit self-center text-sm"
          size="sm"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Product Link
        </Button>
      </div>

      <Separator className="my-2" />

      <ProductSpecifications specifications={product.specifications} />
    </div>
  );
}

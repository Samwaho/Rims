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
  Box,
} from "lucide-react";

// Helper function to format product type with null check
const formatProductType = (type: string | undefined) => {
  if (!type) return "N/A";
  if (type.toLowerCase() === "oem") return "OEM";
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Helper function to format product condition
const formatProductCondition = (condition: string | undefined) => {
  if (!condition) return "New";
  return condition.charAt(0).toUpperCase() + condition.slice(1);
};

// Helper function to get badge color based on product type
const getProductTypeBadgeColor = (type: string | undefined) => {
  switch (type?.toLowerCase()) {
    case "oem":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "aftermarket":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "alloy":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Helper function for condition badge color
const getConditionBadgeColor = (condition: string) => {
  switch (condition?.toLowerCase()) {
    case "new":
      return "bg-green-100 text-green-800 border-green-200";
    case "used":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

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
        <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-8 text-sm lg:text-base">
          <div>
            <span className="font-semibold">Size:</span> {product.size}
          </div>
          {product.madeIn && (
            <div>
              <span className="font-semibold">Origin:</span> {product.madeIn}
            </div>
          )}
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
        {/* Price and Badge Information */}
        <div className="flex flex-col gap-4">
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
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={`${getProductTypeBadgeColor(product.productType)}`}
            >
              {formatProductType(product.productType)} Wheels
            </Badge>
            {typeof product.condition === "string" && product.condition && (
              <Badge
                variant="outline"
                className={`${getConditionBadgeColor(product.condition)}`}
              >
                {product.condition === "new" ? "New" : "Slightly Used"}
              </Badge>
            )}
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

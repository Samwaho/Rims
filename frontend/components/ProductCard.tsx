import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  images: string[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export const ProductCard: React.FC<ProductCardProps> & {
  Skeleton: React.FC;
} = ({ product, onAddToCart }) => {
  return (
    <div className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <Link href={`/products/${product._id}`} className="block">
        <img
          src={product.images[0]}
          alt={product.name}
          width={300}
          height={200}
          className="w-full h-36 md:h-48 object-cover"
          style={{ aspectRatio: "300/200", objectFit: "cover" }}
        />
        <div className="p-4">
          <h3 className="text-lg font-medium line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {product.brand} - {product.category}
          </p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-bold">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button
          size="sm"
          className="w-full bg-primary text-primary-foreground transition-colors duration-300"
          onClick={onAddToCart}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

ProductCard.Skeleton = () => (
  <div className="bg-background rounded-lg overflow-hidden shadow-sm">
    <Skeleton className="w-full h-48" />
    <div className="p-4">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    </div>
  </div>
);

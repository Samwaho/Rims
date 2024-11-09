import Image from "next/image";
import { memo } from "react";
import { Product } from "@/types/product";
import ProductReviews from "./ProductReviews";
import { useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductImagesProps {
  product: Product;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  isAuthenticated: boolean;
  user?: any;
}

const ThumbnailImage = memo(
  ({
    image,
    index,
    isSelected,
    productName,
    onClick,
  }: {
    image: string;
    index: number;
    isSelected: boolean;
    productName: string;
    onClick: () => void;
  }) => (
    <div
      role="button"
      tabIndex={0}
      className={`rounded-lg overflow-hidden transition-all transform hover:scale-105 cursor-pointer ${
        isSelected
          ? "ring-2 ring-primary shadow-lg"
          : "hover:ring-2 hover:ring-primary/50 hover:shadow-md"
      }`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
      aria-label={`View Image ${index + 1}`}
    >
      <Image
        src={image}
        alt={`${productName} - Image ${index + 1}`}
        width={80}
        height={80}
        className="w-16 h-16 object-cover"
      />
    </div>
  )
);

ThumbnailImage.displayName = "ThumbnailImage";

const ProductImages = memo(function ProductImages({
  product,
  selectedImageIndex,
  setSelectedImageIndex,
  isAuthenticated,
  user,
}: ProductImagesProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleZoomToggle = useCallback(() => {
    setIsZoomed((prev) => !prev);
  }, []);

  const handleThumbnailClick = useCallback(
    (index: number) => {
      setSelectedImageIndex(index);
    },
    [setSelectedImageIndex]
  );

  return (
    <div className="space-y-4">
      <div
        className="aspect-square w-full max-w-[500px] relative group cursor-zoom-in"
        onClick={handleZoomToggle}
      >
        <Image
          src={product.images[selectedImageIndex]}
          alt={`${product.name} - Main Image`}
          width={500}
          height={500}
          className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
          priority
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      </div>

      <div className="flex flex-wrap gap-4">
        {product.images.map((image, index) => (
          <ThumbnailImage
            key={index}
            image={image}
            index={index}
            isSelected={index === selectedImageIndex}
            productName={product.name}
            onClick={() => handleThumbnailClick(index)}
          />
        ))}
      </div>

      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <Image
            src={product.images[selectedImageIndex]}
            alt={`${product.name} - Zoomed Image`}
            width={1200}
            height={1200}
            className="w-full h-full object-contain"
          />
        </DialogContent>
      </Dialog>

      <div className="pt-8 hidden lg:block">
        <ProductReviews
          product={product}
          isAuthenticated={isAuthenticated}
          user={user}
        />
      </div>
    </div>
  );
});

ProductImages.displayName = "ProductImages";

export default ProductImages;

import { StarIcon } from "./StarIcon";

interface ProductRatingProps {
  rating: number;
  reviewCount: number;
  showCount?: boolean;
}

export function ProductRating({
  rating,
  reviewCount,
  showCount = true,
}: ProductRatingProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`w-4 h-4 ${
              i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      {showCount && (
        <div className="flex items-center gap-2">
          <span className="font-medium">{rating.toFixed(1)}</span>
          <span className="text-xs lg:text-sm text-gray-500">
            ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>
      )}
    </div>
  );
}

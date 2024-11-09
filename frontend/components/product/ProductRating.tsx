import { StarIcon } from "./StarIcon";
import { useMemo } from "react";

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
  const roundedRating = useMemo(() => Math.round(rating), [rating]);
  const formattedRating = useMemo(() => rating.toFixed(1), [rating]);
  const reviewText = useMemo(
    () => (reviewCount === 1 ? "review" : "reviews"),
    [reviewCount]
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={`w-4 h-4 ${
            i < roundedRating ? "text-yellow-400" : "text-gray-300"
          }`}
          aria-hidden="true"
        />
      )),
    [roundedRating]
  );

  return (
    <div className="flex items-center space-x-4">
      <div className="flex">{stars}</div>
      {showCount && (
        <div className="flex items-center gap-2">
          <span className="font-medium">{formattedRating}</span>
          <span className="text-xs lg:text-sm text-gray-500">
            ({reviewCount} {reviewText})
          </span>
        </div>
      )}
    </div>
  );
}

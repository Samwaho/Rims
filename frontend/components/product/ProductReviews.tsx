import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Product } from "@/types/product";
import { axiosHeaders } from "@/lib/actions";
import { StarIcon } from "./StarIcon";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z
    .string()
    .trim()
    .min(10, "Review must be at least 10 characters")
    .max(500, "Review cannot exceed 500 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ProductReviewsProps {
  product: Product;
  isAuthenticated: boolean;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface ApiError {
  message: string;
  status?: number;
}

interface Review {
  _id: string;
  user: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

export default function ProductReviews({
  product,
  isAuthenticated,
  user,
}: ProductReviewsProps) {
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && user?._id && product.reviews) {
      const hasReviewed = product.reviews.some(
        (review) => review.user === user._id
      );
      setUserHasReviewed(hasReviewed);
    }
  }, [isAuthenticated, product.reviews, user?._id]);

  const addReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      if (!user?._id) {
        throw new Error("User information is not available");
      }

      const reviewData = {
        ...data,
        userId: user._id,
        userName: `${user.firstName} ${user.lastName}`,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${product._id}/reviews`,
        reviewData,
        await axiosHeaders()
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", product._id] });
      toast.success("Your review has been added successfully");
      setShowReviewForm(false);
      form.reset();
      setUserHasReviewed(true);
    },
    onError: (error: Error | AxiosError<ApiError>) => {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        if (message.includes("already reviewed")) {
          setUserHasReviewed(true);
        }
        toast.error(message);
      } else {
        toast.error(error.message);
      }
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to submit a review");
      return;
    }

    if (!user?._id) {
      toast.error("User information is not available");
      return;
    }

    if (!navigator.onLine) {
      toast.error("No internet connection. Please check your network");
      return;
    }

    addReviewMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      {/* Review Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Customer Reviews</h2>
          <span className="text-gray-500">
            ({product.reviews?.length || 0}{" "}
            {product.reviews?.length === 1 ? "review" : "reviews"})
          </span>
        </div>

        <div>
          {isAuthenticated && !showReviewForm && !userHasReviewed && (
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-primary hover:opacity-90 w-full md:w-auto transition-opacity"
            >
              Write a Review
            </Button>
          )}
          {userHasReviewed && (
            <Badge variant="secondary" className="px-4 py-2">
              You have already reviewed this product
            </Badge>
          )}
          {!isAuthenticated && (
            <Badge variant="outline" className="px-4 py-2">
              Sign in to write a review
            </Badge>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 transition-all">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Your Rating</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={`rating-star-${rating}`}
                            type="button"
                            onClick={() => field.onChange(rating)}
                            className={`p-1.5 hover:scale-110 transition-all ${
                              field.value >= rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            aria-label={`Rate ${rating} stars`}
                          >
                            <StarIcon className="w-8 h-8" />
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Your Review</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience with this product (minimum 10 characters)..."
                        className="min-h-[120px] resize-none"
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between">
                      <FormMessage />
                      <span className="text-sm text-gray-500">
                        {field.value.length}/500
                      </span>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex space-x-3 pt-2">
                <Button
                  type="submit"
                  disabled={addReviewMutation.isPending || !navigator.onLine}
                  className="bg-primary hover:opacity-90 px-6 transition-opacity"
                >
                  {addReviewMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⭮</span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-8">
        {product.reviews?.length > 0 ? (
          product.reviews
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((review: Review) => (
              <div
                key={review._id}
                className="flex space-x-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {review.userName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{review.userName}</h3>
                    <time
                      dateTime={review.createdAt}
                      className="text-sm text-gray-500"
                    >
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <div className="flex items-center mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={`review-star-${review._id}-${i}`}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {review.comment}
                  </p>
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-2">No reviews yet</p>
            {isAuthenticated && !userHasReviewed ? (
              <p className="text-sm text-gray-400">
                Be the first to review this product!
              </p>
            ) : (
              !isAuthenticated && (
                <p className="text-sm text-gray-400">
                  Sign in to be the first reviewer
                </p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
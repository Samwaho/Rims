import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ProductSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="w-full aspect-square rounded-lg" />
          <div className="flex space-x-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="w-16 h-16 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <div className="space-y-2">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
          <Separator />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Loading skeletons for components
const LoadingHero = () => (
  <div className="h-[600px] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg" />
);

const LoadingCategories = () => (
  <div className="py-12 md:py-16 lg:py-20">
    <div className="h-8 w-48 mx-auto bg-gray-200 animate-pulse rounded mb-12" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-6xl mx-auto">
      {[1, 2].map((i) => (
        <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-2xl" />
      ))}
    </div>
  </div>
);

const LoadingBanner = () => (
  <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg my-8" />
);

const LoadingCTA = () => (
  <div className="h-80 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg" />
);

// Dynamic imports with skeleton loading states
const Hero = dynamic(() => import("@/components/hero/page"), {
  loading: LoadingHero,
});
const Categories = dynamic(() => import("@/components/categories/page"), {
  loading: LoadingCategories,
});
const Banner = dynamic(() => import("@/components/banner/page"), {
  loading: LoadingBanner,
});
const CTA = dynamic(() => import("@/components/CTA/page"), {
  loading: LoadingCTA,
});

export const metadata = {
  title: "Home | WheelsHub",
  description: "Welcome to our store. Find the best products at great prices.",
  keywords: "store, shopping, products, deals",
  openGraph: {
    title: "Home | WheelsHub",
    description:
      "Welcome to our store. Find the best products at great prices.",
    type: "website",
  },
};

// Cache page for 1 hour
export const revalidate = 3600;

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen space-y-8">
          <LoadingHero />
          <LoadingCategories />
          <LoadingBanner />
          <LoadingCTA />
        </div>
      }
    >
      <main className="min-h-screen">
        <Hero />
        <Categories />
        <Banner />
        <CTA />
      </main>
    </Suspense>
  );
}

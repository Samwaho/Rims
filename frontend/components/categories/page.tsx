import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import TiresCat from "@/public/TIRE.png";
import WheelsCat from "@/public/BannerImg.png";

const ArrowIcon = memo(() => (
  <svg
    className="ml-2 w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
));

ArrowIcon.displayName = "ArrowIcon";

const CategoryCard = memo(
  ({
    title,
    description,
    image,
    href,
    buttonText,
  }: {
    title: string;
    description: string;
    image: any;
    href: string;
    buttonText: string;
  }) => (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      <div className="relative overflow-hidden h-64 bg-gradient-to-t from-black/40 to-transparent">
        <Image
          src={image}
          fill
          style={{ objectFit: "contain" }}
          alt={title}
          className="transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      <div className="p-6 md:p-8">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight mb-3 md:mb-4 group-hover:text-primary transition-colors duration-300">
          {title}
        </h2>
        <p className="text-gray-600 mb-6 text-sm md:text-base">{description}</p>
        <Link
          href={href}
          className="inline-flex h-10 md:h-12 items-center justify-center rounded-lg bg-primary px-6 md:px-8 text-sm md:text-base font-medium text-white shadow-lg transition-all duration-300 hover:bg-primary/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:shadow-primary/30"
        >
          {buttonText}
          <ArrowIcon />
        </Link>
      </div>
    </div>
  )
);

CategoryCard.displayName = "CategoryCard";

const categories = [
  {
    title: "Premium Tyres",
    description:
      "Experience superior performance with our collection of high-quality tyres, engineered for exceptional grip, durability, and driving comfort.",
    image: TiresCat,
    href: "/products?category=tyres",
    buttonText: "Shop Tyres",
  },
  {
    title: "Luxury Wheels",
    description:
      "Transform your vehicle with our exclusive collection of premium wheels, designed to deliver both stunning aesthetics and optimal performance.",
    image: WheelsCat,
    href: "/products?category=wheels",
    buttonText: "Shop Wheels",
  },
] as const;

const Categories = memo(() => {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-gray-100 mt-4">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 animate-gradient">
          Browse Categories
        </h2>

        <div className="mb-12 text-center">
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-white shadow-lg transition-all duration-300 hover:bg-primary/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:shadow-primary/30"
          >
            View All Products
            <ArrowIcon />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-6xl mx-auto">
          {categories.map((category) => (
            <CategoryCard key={category.title} {...category} />
          ))}
        </div>
      </div>
    </section>
  );
});

Categories.displayName = "Categories";

export default Categories;

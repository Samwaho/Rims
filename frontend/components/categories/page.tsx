"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Car, Wrench, Zap } from "lucide-react";

const ArrowIcon = () => (
  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
);

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "rims":
      return <Car className="w-6 h-6" />;
    case "offroad-rims":
      return <Zap className="w-6 h-6" />;
    case "tyres":
      return <Car className="w-6 h-6" />;
    case "accessories":
      return <Wrench className="w-6 h-6" />;
    case "cars":
      return <Car className="w-6 h-6" />;
    default:
      return <Sparkles className="w-6 h-6" />;
  }
};

const CategoryCard = memo(
  ({
    title,
    image,
    category,
  }: {
    title: string;
    image: any;
    category: string;
  }) => (
    <div className="group flex flex-col items-center bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
      {/* Image at the top */}
      <div className="w-full aspect-[4/3] relative">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover w-full h-full"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      {/* Category Name and Icon */}
      <div className="flex flex-col items-center p-4 w-full">
        <div className="flex items-center gap-2">
          <CategoryIcon category={category} />
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
      </div>
    </div>
  )
);

CategoryCard.displayName = "CategoryCard";

const categories = [
  {
    title: "Auto Accessories",
    description:
      "Enhance your vehicle with our premium accessories, from performance upgrades to aesthetic enhancements for the perfect finish.",
    image: "https://images.unsplash.com/photo-1627913434632-b4717be3485a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FyJTIwYWNjZXNzb3JpZXN8ZW58MHx8MHx8fDA%3D",
    href: "/products?category=accessories",
    buttonText: "Shop Accessories",
    category: "accessories",
  },
  {
    title: "Premium Tyres",
    description:
      "Experience superior performance with our collection of high-quality tyres, engineered for exceptional grip, durability, and driving comfort.",
    image: "https://images.unsplash.com/photo-1693441466798-cd56329c4377?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fHR5cmVzfGVufDB8fDB8fHww",
    href: "/products?category=tyres",
    buttonText: "Shop Tyres",
    category: "tyres",
  },
  {
    title: "Premium Rims",
    description:
      "Discover our exclusive collection of premium rims, designed to deliver both stunning aesthetics and optimal performance for your vehicle.",
    image: "https://images.unsplash.com/photo-1708576180322-8839d3d9fd1d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmltc3xlbnwwfHwwfHx8MA%3D%3Dr",
    href: "/products?category=rims",
    buttonText: "Shop Rims",
    category: "rims",
  },
  {
    title: "Off-Road Rims",
    description:
      "Built for adventure with our rugged off-road rims, engineered to withstand the toughest terrains while maintaining superior performance.",
    image: "https://images.unsplash.com/photo-1560380968-8753ed6f51ab?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b2Zmcm9hZCUyMHJpbXN8ZW58MHx8MHx8fDA%3D",
    href: "/products?category=offroad-rims",
    buttonText: "Shop Off-Road Rims",
    category: "offroad-rims",
  },
  
  
  {
    title: "Cars",
    description:
      "Find your perfect vehicle from our carefully curated selection of quality cars, all thoroughly inspected and ready for the road.",
    image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGF1dG9tb3RpdmV8ZW58MHx8MHx8fDA%3D",
    href: "/products?category=cars",
    buttonText: "Browse Cars",
    category: "cars",
  },
] as const;

const Categories = memo(() => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] bg-[length:20px_20px]" />
      
      <div className="container px-4 mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Explore Our Categories
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
            Browse Categories
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover our comprehensive range of automotive products, from premium rims to quality tyres and everything in between.
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-16">
          <Link
            href="/products"
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-10 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/20 hover:shadow-primary/30"
          >
            View All Products
            <ArrowIcon />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 max-w-7xl mx-auto">
          {categories.map((category, index) => (
            <div
              key={category.title}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <CategoryCard title={category.title} image={category.image} category={category.category} />
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Can't Find What You're Looking For?
            </h3>
            <p className="text-gray-600 mb-6">
              Our team is here to help you find the perfect automotive products for your needs.
            </p>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-medium text-white shadow-lg transition-all duration-300 hover:bg-primary/80 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-900/20"
            >
              Contact Us
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </section>
  );
});

Categories.displayName = "Categories";

export default Categories;

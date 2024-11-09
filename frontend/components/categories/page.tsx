import React from "react";
import Image from "next/image";
import Link from "next/link";
import TiresCat from "@/public/TIresCat.png";
import WheelsCat from "@/public/WheelsCat.png";

const Categories = () => {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-gray-100 mt-4">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          Browse Categories
        </h2>

        {/* All Categories Card */}
        <div className="mb-8 text-center">
          <Link
            href="/products"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-6 text-sm font-medium text-white shadow transition-all duration-300 hover:bg-red-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            View All Products
            <svg
              className="ml-2 w-4 h-4"
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
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto">
          <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative overflow-hidden">
              <Image
                src={TiresCat}
                width={250}
                height={250}
                alt="Tyres"
                className="mx-auto transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="p-4 md:p-6">
              <h2 className="text-lg md:text-2xl font-bold tracking-tight mb-2 md:mb-3">
                Premium Tyres
              </h2>
              <p className="text-gray-600 mb-4 text-sm md:text-base hidden md:block">
                Experience superior performance with our collection of
                high-quality tyres, engineered for exceptional grip, durability,
                and driving comfort.
              </p>
              <Link
                href="/products?category=tyre"
                className="inline-flex h-8 md:h-10 items-center justify-center rounded-lg bg-red-600 px-4 md:px-6 text-xs md:text-sm font-medium text-white shadow transition-all duration-300 hover:bg-red-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Shop Tyres
                <svg
                  className="ml-2 w-3 h-3 md:w-4 md:h-4"
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
              </Link>
            </div>
          </div>

          <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative overflow-hidden">
              <Image
                src={WheelsCat}
                width={250}
                height={250}
                alt="Wheels"
                className="mx-auto transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="p-4 md:p-6">
              <h2 className="text-lg md:text-2xl font-bold tracking-tight mb-2 md:mb-3">
                Luxury Wheels
              </h2>
              <p className="text-gray-600 mb-4 text-sm md:text-base hidden md:block">
                Transform your vehicle with our exclusive collection of premium
                wheels, designed to deliver both stunning aesthetics and optimal
                performance.
              </p>
              <Link
                href="/products?category=wheel"
                className="inline-flex h-8 md:h-10 items-center justify-center rounded-lg bg-red-600 px-4 md:px-6 text-xs md:text-sm font-medium text-white shadow transition-all duration-300 hover:bg-red-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Shop Wheels
                <svg
                  className="ml-2 w-3 h-3 md:w-4 md:h-4"
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
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;

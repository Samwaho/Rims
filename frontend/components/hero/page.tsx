import Image from "next/image";
import Link from "next/link";
import React from "react";
import HeroCar from "@/public/hero.jpg";

const Hero = () => {
  return (
    <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/20 to-transparent"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-20 "></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-20"></div>

      <div className="container grid items-center gap-8 px-4 md:px-6 lg:grid-cols-2 lg:gap-12 relative">
        <div className="space-y-8 animate-fadeIn">
          <div className="space-y-4">
            <span className="px-3 py-1 text-sm font-medium bg-black/5 rounded-full text-gray-700 backdrop-blur-sm">
              Premium Quality ✨ Lifetime Warranty
            </span>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 drop-shadow-sm">
              Find Your Perfect <br />
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text">
                Wheels
              </span>
            </h1>
          </div>
          <p className="max-w-[600px] text-gray-700 text-lg md:text-xl/relaxed lg:text-lg/relaxed xl:text-xl/relaxed leading-relaxed">
            Discover our curated collection of premium tires and wheels for your
            luxury vehicle. Experience unmatched quality, style, and performance
            with every mile.
          </p>
          <div className="flex flex-row gap-4">
            <Link
              href="/products"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-6 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:bg-red-700 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:pointer-events-none disabled:opacity-50"
            >
              Shop Now
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-6 text-sm font-medium text-black border-2 border-black/10 shadow-lg transition-all duration-300 hover:bg-gray-50 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50"
            >
              Contact Us
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"
                ></div>
              ))}
            </div>
            <p>
              Join <span className="font-semibold">2,000+</span> satisfied
              customers
            </p>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-black/20 rounded-2xl transform rotate-6 transition-transform group-hover:rotate-2 mx-8"></div>
          <Image
            src={HeroCar}
            width={500}
            height={500}
            alt="Luxury Car Wheels"
            className="relative z-10 mx-auto overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-3xl"
            priority
            quality={100}
          />
          <div className="absolute inset-0 z-20 rounded-2xl bg-gradient-to-t from-black/20 to-transparent mx-8"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

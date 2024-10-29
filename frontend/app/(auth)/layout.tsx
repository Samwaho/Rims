import React from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/Logo.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Left side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-60" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>

        <div className="w-full max-w-xl relative z-10">
          {/* Mobile Logo */}
          <div className="md:hidden mb-10 flex flex-col items-center">
            <div className="relative w-28 h-28">
              <Link href="/">
                <Image
                  src={Logo}
                  alt="Logo"
                  fill
                  className="object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                  priority
                />
              </Link>
            </div>

            <h2 className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text">
                WheelsHub
              </span>
            </h2>
            <span className="px-3 py-1 text-sm font-medium bg-black/5 rounded-full text-gray-700 backdrop-blur-sm mt-4">
              Premium Quality ✨ Lifetime Warranty
            </span>
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Brand/Logo Section */}
      <div className="hidden md:flex flex-1 items-center justify-center p-10 lg:p-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-60" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>

        <div className="relative z-10 text-center space-y-8 animate-fadeIn">
          <div className="mb-10 relative w-56 h-56 mx-auto">
            <Link href="/">
              <Image
                src={Logo}
                alt="Logo"
                fill
                className="object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                priority
              />
            </Link>
          </div>
          <div className="space-y-4">
            <span className="px-3 py-1 text-sm font-medium bg-black/5 rounded-full text-gray-700 backdrop-blur-sm">
              Premium Quality ✨ Lifetime Warranty
            </span>
            <h2 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text">
                WheelsHub
              </span>
            </h2>
          </div>
          <p className="text-gray-700 max-w-lg mx-auto leading-relaxed text-lg">
            Discover and order premium wheels for your vehicle with our
            easy-to-use platform. Browse our extensive collection and find the
            perfect set to enhance your ride's style and performance.
          </p>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-16">
        <div className="w-full max-w-xl">
          {/* Mobile Logo */}
          <div className="md:hidden mb-10 flex flex-col items-center">
            <div className="relative w-28 h-28">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain drop-shadow-sm cursor-pointer"
                  priority
                />
              </Link>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">
              Welcome to WheelsHub
            </h2>
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Brand/Logo Section */}
      <div className="hidden md:flex flex-1 bg-white items-center justify-center p-10 lg:p-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-gray-50 to-blue-50 opacity-60" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>
        <div className="relative z-10 text-center">
          <div className="mb-10 relative w-56 h-56 mx-auto">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                priority
              />
            </Link>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-8">
            Welcome to WheelsHub
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto leading-relaxed text-lg">
            Discover and order premium wheels for your vehicle with our
            easy-to-use platform. Browse our extensive collection and find the
            perfect set to enhance your ride's style and performance.
          </p>
        </div>
      </div>
    </div>
  );
}

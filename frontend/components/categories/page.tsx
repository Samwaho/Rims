import React from "react";
import Image from "next/image";
import Link from "next/link";
import TiresCat from "@/public/TIresCat.png";
import WheelsCat from "@/public/WheelsCat.png";

const Categories = () => {
  return (
    <section className="">
      <h2 className="text-2xl font-bold mt-6">Categories</h2>
      <div className="grid grid-cols-2 gap-4 w-full py-4">
        <div className="bg-gray-200 rounded-lg overflow-hidden shadow-md">
          <Image
            src={TiresCat}
            width={250}
            height={250}
            alt="Tyres"
            className="mx-auto"
          />
          <div className="p-4">
            <h2 className="text-lg font-bold tracking-tight mb-2">Tyres</h2>
            <p className="text-sm text-muted-foreground mb-3">
              High-performance tyres for exceptional grip and comfort.
            </p>
            <Link
              href="/products?category=wheel"
              className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground shadow transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Shop Tyres
            </Link>
          </div>
        </div>
        <div className="bg-gray-200 rounded-lg overflow-hidden shadow-md">
          <Image
            src={WheelsCat}
            width={250}
            height={250}
            alt="Wheels"
            className="mx-auto"
          />
          <div className="p-4">
            <h2 className="text-lg font-bold tracking-tight mb-2">Wheels</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Stylish and durable wheels to complement your luxury vehicle.
            </p>
            <Link
              href="/products?category=rim"
              className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground shadow transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Shop Wheels
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;

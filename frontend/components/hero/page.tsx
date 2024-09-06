import Image from "next/image";
import Link from "next/link";
import React from "react";

const Hero = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-200 shadow-md">
      <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Find Your Perfect Wheels
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Discover our wide selection of high-quality tires and wheels for
            your luxury vehicle. Upgrade your ride with the perfect set.
          </p>
          <Link
            href="#"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Shop Now
          </Link>
        </div>
        <div className="relative">
          <div className="absolute  sm:top-[-5%] lg:top-[-10%] left-[-3%] inset-0 bg-primary rounded-xl w-[60%] h-[200px] lg:h-[400px]  mx-auto"></div>
          <Image
            src="/HeroCar.png"
            width={800}
            height={600}
            alt="Luxury Car Wheels"
            className="relative z-10 mx-auto aspect-video overflow-hidden object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;

import Image from "next/image";
import React from "react";
import HeroCar from "@/public/HeroCar.png";
import { Button } from "../ui/button";

const Hero = () => {
  return (
    <div className="flex mt-4">
      <div className="flex-1 mt-8">
        <h1 className="font-bold text-lg">All Premium Quality Products</h1>
        <p className="text-sm text-gray-600">
          Find what Fits your ride. From Wheels and Tyres
        </p>
        <Button className="mt-6 rounded-none uppercase">View Products</Button>
      </div>
      <div className="bg-primary relative flex-1 rounded-lg h-[250px]"></div>
      <Image
        src={HeroCar}
        alt="Hero Image"
        width={300}
        height={400}
        className="absolute -right-6 mt-4"
      />
    </div>
  );
};

export default Hero;

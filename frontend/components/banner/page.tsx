import Image from "next/image";
import React from "react";
import BannerIMG1 from "@/public/BannerImg1.png";
import BannerIMG2 from "@/public/BannerImg2.png";
import { Button } from "../ui/button";

const Banner = () => {
  return (
    <section
      className="mt-6 px-6 py-4 bg-gray-200
    "
    >
      <p className="text-center text-sm">
        Discover Excellent Service & Greatest Range of
      </p>
      <h2 className="text-xl font-bold text-center mt-4">
        QUALITY PRODUCTS FROM TRUSTED BRANDS.
      </h2>
      <div className="flex gap-2 items-center">
        <Image
          src={BannerIMG1}
          alt="Tires"
          width={100}
          height={80}
          className="-ms-8 -mt-10"
        />
        <Button>+2547 123 456 789</Button>
        <Image
          src={BannerIMG2}
          alt="Tires"
          width={120}
          height={20}
          className="-me-8 -mt-10"
        />
      </div>
    </section>
  );
};

export default Banner;

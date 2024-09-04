"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import BannerIMG1 from "@/public/BannerImg1.png";
import BannerIMG2 from "@/public/BannerImg2.png";
import { Button } from "../ui/button";

const Banner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2024-12-31T23:59:59").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });

      if (difference < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="mt-6 px-6 py-4 bg-gray-200 shadow-md
    "
    >
      <p className="text-center text-sm">
        Discover Excellent Service & Greatest Range of
      </p>
      <h2 className="text-xl font-bold text-center mt-4">
        QUALITY PRODUCTS FROM TRUSTED BRANDS.
      </h2>
      <div className="flex gap-2 items-center justify-center lg:mt-8">
        <Image
          src={BannerIMG1}
          alt="Tires"
          width={80}
          height={70}
          className="sm:ms-8 sm:-mt-10"
        />
        <Button>+2547 123 456 789</Button>
        <Image
          src={BannerIMG2}
          alt="Tires"
          width={120}
          height={20}
          className="sm:-me-8 sm:-mt-10"
        />
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Offer ends in:
      </p>
      <div className="flex justify-center items-center mt-4">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold">{timeLeft.days}</p>
            <p className="text-sm text-muted-foreground">Days</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold">{timeLeft.hours}</p>
            <p className="text-sm text-muted-foreground">Hours</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold">{timeLeft.minutes}</p>
            <p className="text-sm text-muted-foreground">Minutes</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold">{timeLeft.seconds}</p>
            <p className="text-sm text-muted-foreground">Seconds</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;

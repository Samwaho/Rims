"use client";
import Image from "next/image";
import React, { memo, useState, useEffect, useCallback } from "react";
import BannerIMG1 from "@/public/BannerImg1.png";
import BannerIMG2 from "@/public/BannerImg2.png";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

const StarIcon = memo(() => <Star className="w-6 h-6 text-primary" />);

StarIcon.displayName = "StarIcon";

const CountdownItem = memo(
  ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-primary text-white rounded-lg p-2 w-full">
        <p className="text-xl font-bold">{String(value).padStart(2, "0")}</p>
      </div>
      <p className="text-xs font-medium text-gray-600 mt-1">{label}</p>
    </div>
  )
);

CountdownItem.displayName = "CountdownItem";

const BannerImage = memo(
  ({ src, alt, height }: { src: any; alt: string; height: number }) => (
    <div className="hidden md:block transform hover:scale-105 transition-transform duration-300">
      <Image
        src={src}
        alt={alt}
        width={400}
        height={400}
        quality={100}
        className={`w-[200px] h-[${height}px]`}
      />
    </div>
  )
);

BannerImage.displayName = "BannerImage";

const Banner = memo(() => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeLeft = useCallback(() => {
    const targetDate = new Date("2024-12-31T23:59:59").getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference < 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      ),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  const countdownItems = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hrs" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Sec" },
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-gray-100 mt-4">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="animate-pulse">
            <StarIcon />
          </span>
          <p className="text-center text-sm font-semibold text-primary tracking-wider uppercase">
            Exclusive Holiday Deals
          </p>
          <span className="animate-pulse">
            <StarIcon />
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-center mt-2 mb-8">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            SAVE UP TO 40% OFF
          </span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8 items-center justify-center">
          <BannerImage src={BannerIMG1} alt="Premium Tires" height={200} />

          <div className="space-y-6 text-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-primary/10">
              <p className="text-lg font-semibold text-gray-800 mb-4">
                Flash Sale Countdown
              </p>
              <div className="grid grid-cols-4 gap-3">
                {countdownItems.map((item, index) => (
                  <CountdownItem key={index} {...item} />
                ))}
              </div>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-6 py-2 rounded-xl font-bold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <BannerImage src={BannerIMG2} alt="Luxury Wheels" height={180} />
        </div>
      </div>
    </section>
  );
});

Banner.displayName = "Banner";

export default Banner;

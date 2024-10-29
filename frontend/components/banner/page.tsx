"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import BannerIMG1 from "@/public/BannerImg1.png";
import BannerIMG2 from "@/public/BannerImg2.png";
import Link from "next/link";

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

      if (difference < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-gray-100 mt-4">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="animate-pulse">
            <svg
              className="w-6 h-6 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
          <p className="text-center text-sm font-semibold text-red-600 tracking-wider uppercase">
            Exclusive Holiday Deals
          </p>
          <span className="animate-pulse">
            <svg
              className="w-6 h-6 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-center mt-2 mb-8">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            SAVE UP TO 40% OFF
          </span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8 items-center justify-center">
          <div className="hidden md:block transform hover:scale-105 transition-transform duration-300">
            <Image
              src={BannerIMG1}
              alt="Premium Tires"
              width={400}
              height={400}
              quality={100}
              className="w-[200px] h-[200px]"
            />
          </div>

          <div className="space-y-6 text-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-red-100">
              <p className="text-lg font-semibold text-gray-800 mb-4">
                Flash Sale Countdown
              </p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: timeLeft.days, label: "Days" },
                  { value: timeLeft.hours, label: "Hrs" },
                  { value: timeLeft.minutes, label: "Min" },
                  { value: timeLeft.seconds, label: "Sec" },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="bg-red-600 text-white rounded-lg p-2 w-full">
                      <p className="text-xl font-bold">
                        {String(item.value).padStart(2, "0")}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-gray-600 mt-1">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-xl font-bold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Shop Now
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          <div className="hidden md:block transform hover:scale-105 transition-transform duration-300">
            <Image
              src={BannerIMG2}
              alt="Luxury Wheels"
              width={400}
              height={360}
              quality={100}
              className="w-[200px] h-[180px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;

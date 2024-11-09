import { Suspense } from "react";
import Banner from "@/components/banner/page";
import Categories from "@/components/categories/page";
import CTA from "@/components/CTA/page";
import Footer from "@/components/footer/page";
import Hero from "@/components/hero/page";
import Navbar from "@/components/navbar/page";

export const metadata = {
  title: "Home | Your Store Name",
  description: "Welcome to our store",
};

export const revalidate = 3600; // Revalidate every hour

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className="">
        <Hero />
        <Categories />
        <Banner />
        <CTA />
      </main>
    </Suspense>
  );
}

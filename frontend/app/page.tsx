import Banner from "@/components/banner/page";
import Categories from "@/components/categories/page";
import CTA from "@/components/CTA/page";
import Footer from "@/components/footer/page";
import Hero from "@/components/hero/page";
import Navbar from "@/components/navbar/page";

export default function Home() {
  return (
    <main className="">
      <Hero />
      <Categories />
      <Banner />
      <CTA />
    </main>
  );
}

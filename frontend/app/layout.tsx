import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer/page";
import Navbar from "@/components/navbar/page";
import TanstackProvider from "@/providers/TanstackProvider";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WheelsHub - Premium Wheels and Rims",
  description:
    "Discover and shop the best selection of wheels and rims for your vehicle at WheelsHub, your trusted ecommerce platform for automotive enthusiasts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <TanstackProvider>
          <main className="min-h-screen bg-gradient-to-tl from-gray-300 to-white">
            <Navbar />
            <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
              {children}
            </div>
            <Footer />
          </main>
          <Toaster />
        </TanstackProvider>
      </body>
    </html>
  );
}

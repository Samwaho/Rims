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
    <html lang="en" className="h-full">
      <body className={`${poppins.className} flex flex-col min-h-screen`}>
        <TanstackProvider>
          <Navbar />
          <main className="flex-grow bg-gradient-to-tl from-gray-300 to-white">
            <div className="max-w-[100rem] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-8">
              {children}
            </div>
          </main>
          <Footer />
          <Toaster />
        </TanstackProvider>
      </body>
    </html>
  );
}

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
    <html lang="en" className="">
      <body className={`${poppins.className}`}>
        <TanstackProvider>
          {children}
          <Toaster
            toastOptions={{
              classNames: {
                error:
                  "text-rose-600 bg-card_light dark:bg-card_dark border-none",
                success:
                  "text-green-600 bg-card_light dark:bg-card_dark border-none",
                warning: "text-yellow-400 bg-card_light dark:bg-card_dark",
                info: "text-sky-600 bg-card_light dark:bg-card_dark",
              },
            }}
          />
        </TanstackProvider>
      </body>
    </html>
  );
}

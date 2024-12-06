import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer/page";
import Navbar from "@/components/navbar/page";
import TanstackProvider from "@/providers/TanstackProvider";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";
const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID || "";
export const metadata: Metadata = {
  title: "Jara Wheels - Premium Wheels and Rims",
  description:
    "Discover and shop the best selection of wheels and rims for your vehicle at Jara Wheels, your trusted ecommerce platform for automotive enthusiasts.",
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
        <GoogleAnalytics gaId={googleAnalyticsId} />
        <Script strategy="lazyOnload">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/67527ba24304e3196aed2448/1ied35t54';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}

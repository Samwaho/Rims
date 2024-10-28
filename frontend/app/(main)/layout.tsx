import Footer from "@/components/footer/page";
import NavbarWrapper from "@/components/navbar/NavbarWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col min-h-screen">
      <NavbarWrapper />
      <div className="flex-grow bg-gradient-to-tl from-gray-300 to-white">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-8">
          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
}

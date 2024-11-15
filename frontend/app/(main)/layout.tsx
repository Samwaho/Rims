import Footer from "@/components/footer/page";
import NavbarWrapper from "@/components/navbar/NavbarWrapper";

interface LayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: Readonly<LayoutProps>) => {
  return (
    <main className="flex min-h-screen flex-col">
      <NavbarWrapper />
      <div className="flex-grow bg-gradient-to-tl from-gray-300 to-white">
        <div className="mx-auto max-w-[100rem] px-1 py-8 sm:px-2 md:px-4 lg:px-6">
          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default RootLayout;

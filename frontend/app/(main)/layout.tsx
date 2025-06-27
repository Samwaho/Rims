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
        {children}
      </div>
      <Footer />
    </main>
  );
};

export default RootLayout;

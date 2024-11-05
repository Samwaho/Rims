"use client";
import Image from "next/image";
import React, { useState } from "react";
import logo from "@/public/Logo.png";
import { IoCartOutline, IoMenu, IoSearchOutline } from "react-icons/io5";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { IoMdClose } from "react-icons/io";
import { Input } from "../ui/input";
import Link from "next/link";
import { getAuthUser } from "@/lib/actions";
import CartCount from "../CartCount";
import { useRouter, useSearchParams } from "next/navigation";

interface NavbarProps {
  initialLoggedIn: boolean;
  isAdmin?: boolean;
}

const Navbar = ({ initialLoggedIn, isAdmin }: NavbarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsDrawerOpen(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleDrawerLinkClick = (href: string) => {
    router.push(href);
    setIsDrawerOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between py-4 px-4 md:px-6 lg:px-12 xl:px-20">
      <Link href="/" className="transition-transform hover:scale-105">
        <Image
          src={logo}
          alt="Logo"
          width={120}
          height={80}
          className="w-24 md:w-28 lg:w-32"
          priority
        />
      </Link>
      <div className="hidden lg:flex items-center gap-2 max-w-xl relative">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 w-[400px] focus:w-[500px] transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IoSearchOutline
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <button type="submit" className="sr-only">
            Search
          </button>
        </form>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-6">
          <Link
            href="/"
            className="text-lg xl:text-xl hover:text-gray-600 transition-colors relative group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
          </Link>
          <Link
            href="/products"
            className="text-lg xl:text-xl hover:text-gray-600 transition-colors relative group"
          >
            Products
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="text-lg xl:text-xl hover:text-gray-600 transition-colors relative group"
            >
              Admin
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
            </Link>
          )}

          {loggedIn ? (
            <Link href="/cart" className="relative">
              <Button className="px-2 w-20 h-8 text-sm xl:w-24 xl:h-10 xl:text-base flex items-center gap-2 hover:scale-105 transition-transform">
                <span>Cart</span>
                <IoCartOutline size={20} />
              </Button>
              <CartCount />
            </Link>
          ) : (
            <Link href="/sign-in">
              <Button className="px-2 w-20 h-8 text-sm xl:w-24 xl:h-10 xl:text-base hover:scale-105 transition-transform">
                Sign In
              </Button>
            </Link>
          )}
        </div>
        <Drawer
          direction="left"
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        >
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden hover:bg-gray-100 transition-colors"
              onClick={() => setIsDrawerOpen(true)}
            >
              <IoMenu size={24} className="text-gray-800" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-gradient-to-tl from-gray-300 to-white h-screen w-80 pt-safe-top">
            <DrawerHeader className="mt-4">
              <DrawerTitle className="flex justify-between items-center">
                <Image
                  src={logo}
                  alt="Logo"
                  width={120}
                  height={80}
                  className="w-24 md:w-28"
                  priority
                />
                <DrawerClose asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-gray-100 transition-colors"
                    onClick={closeDrawer}
                  >
                    <IoMdClose size={24} className="text-gray-800" />
                  </Button>
                </DrawerClose>
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-6 py-4">
              <form onSubmit={handleMobileSearch}>
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="w-full mb-6"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="sr-only">
                  Search
                </button>
              </form>
            </div>
            <div className="flex flex-col gap-6 px-6">
              <button
                onClick={() => handleDrawerLinkClick("/")}
                className="text-xl text-left hover:text-gray-600 transition-colors relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
              </button>
              <button
                onClick={() => handleDrawerLinkClick("/products")}
                className="text-xl text-left hover:text-gray-600 transition-colors relative group"
              >
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleDrawerLinkClick("/admin")}
                  className="text-xl text-left hover:text-gray-600 transition-colors relative group"
                >
                  Admin
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
                </button>
              )}
            </div>
            <DrawerFooter>
              {!loggedIn ? (
                <button
                  onClick={() => handleDrawerLinkClick("/sign-in")}
                  className="w-full"
                >
                  <Button className="w-full hover:scale-105 transition-transform">
                    Sign In
                  </Button>
                </button>
              ) : (
                <button
                  onClick={() => handleDrawerLinkClick("/cart")}
                  className="relative w-full"
                >
                  <Button className="w-full mt-4 flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                    <span>Cart</span>
                    <IoCartOutline size={20} />
                  </Button>
                  <CartCount />
                </button>
              )}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
};

export default Navbar;

"use client";
import Image from "next/image";
import React, { useState, useCallback } from "react";
import logo from "@/public/wheelshublogo.png";
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

  const handleSearch = useCallback(
    (e: React.FormEvent, isMobile = false) => {
      e.preventDefault();
      const trimmedSearch = searchTerm.trim();
      const searchUrl = trimmedSearch
        ? `/products?search=${encodeURIComponent(trimmedSearch)}`
        : "/products";

      router.push(searchUrl);
      if (isMobile) setIsDrawerOpen(false);
    },
    [searchTerm, router]
  );

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleDrawerLinkClick = useCallback(
    (href: string) => {
      router.push(href);
      setIsDrawerOpen(false);
    },
    [router]
  );

  const renderNavLink = useCallback(
    ({ href, text }: { href: string; text: string }) => (
      <Link
        href={href}
        className="text-base xl:text-lg font-medium text-gray-700 hover:text-primary transition-colors relative group"
      >
        {text}
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Link>
    ),
    []
  );

  const renderDrawerLink = useCallback(
    ({ href, text }: { href: string; text: string }) => (
      <div
        onClick={() => handleDrawerLinkClick(href)}
        className="text-lg font-medium text-gray-700 hover:text-primary transition-colors relative group cursor-pointer"
      >
        {text}
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </div>
    ),
    [handleDrawerLinkClick]
  );

  const renderAuthButton = useCallback(
    (isMobile = false) => {
      if (!loggedIn) {
        return isMobile ? (
          <div
            onClick={() => handleDrawerLinkClick("/sign-in")}
            className="w-full"
          >
            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
              Sign In
            </Button>
          </div>
        ) : (
          <Link href="/sign-in">
            <Button className="px-6 h-10 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
              Sign In
            </Button>
          </Link>
        );
      }

      return isMobile ? (
        <div
          onClick={() => handleDrawerLinkClick("/cart")}
          className="relative w-full"
        >
          <Button className="w-full mt-4 flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
            <span>Cart</span>
            <IoCartOutline size={22} />
          </Button>
          <CartCount />
        </div>
      ) : (
        <Link href="/cart" className="relative">
          <Button className="px-6 h-10 flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
            <span>Cart</span>
            <IoCartOutline size={22} />
          </Button>
          <CartCount />
        </Link>
      );
    },
    [loggedIn, handleDrawerLinkClick]
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-[2000px] mx-auto flex items-center justify-between py-4 px-4 md:px-8 lg:px-12 xl:px-20">
        <Link
          href="/"
          className="transform hover:scale-105 transition duration-300"
        >
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
          <form onSubmit={(e) => handleSearch(e)} className="relative group">
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 w-[400px] focus:w-[500px] h-11 border-gray-200 focus:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IoSearchOutline
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300"
              size={20}
            />
            <button type="submit" className="sr-only">
              Search
            </button>
          </form>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-8">
            {renderNavLink({ href: "/", text: "Home" })}
            {renderNavLink({ href: "/products", text: "Products" })}
            {loggedIn && renderNavLink({ href: "/orders", text: "Orders" })}
            {isAdmin && renderNavLink({ href: "/admin", text: "Admin" })}
            {renderAuthButton()}
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
                className="lg:hidden hover:bg-gray-50 border-gray-200 transition-colors"
                onClick={() => setIsDrawerOpen(true)}
              >
                <IoMenu size={24} className="text-gray-700" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-gradient-to-tl from-gray-100 to-white h-screen w-80 pt-safe-top">
              <DrawerHeader className="mt-6">
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
                      className="hover:bg-gray-50 border-gray-200 transition-colors"
                      onClick={closeDrawer}
                    >
                      <IoMdClose size={24} className="text-gray-700" />
                    </Button>
                  </DrawerClose>
                </DrawerTitle>
              </DrawerHeader>
              <div className="px-6 py-4">
                <form
                  onSubmit={(e) => handleSearch(e, true)}
                  className="relative group"
                >
                  <Input
                    type="text"
                    placeholder="Search products..."
                    className="w-full mb-6 h-11 border-gray-200 focus:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="sr-only">
                    Search
                  </button>
                </form>
              </div>
              <div className="flex flex-col gap-6 px-6">
                {renderDrawerLink({ href: "/", text: "Home" })}
                {renderDrawerLink({ href: "/products", text: "Products" })}
                {loggedIn &&
                  renderDrawerLink({ href: "/orders", text: "Orders" })}
                {isAdmin && renderDrawerLink({ href: "/admin", text: "Admin" })}
              </div>
              <DrawerFooter>{renderAuthButton(true)}</DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

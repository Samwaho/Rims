"use client";
import Image from "next/image";
import React, { useState, useCallback, useEffect } from "react";
import logo from "@/public/wheelshublogo.png";
import {
  IoCartOutline,
  IoMenu,
  IoSearchOutline,
  IoPersonOutline,
  IoLogOutOutline,
} from "react-icons/io5";
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
import { getAuthUser, logout } from "@/lib/actions";
import CartCount from "../CartCount";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavSearch } from "./NavSearch";
import { UserDropdown } from "./UserDropdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";

interface NavbarProps {
  initialLoggedIn: boolean;
  isAdmin?: boolean;
}

const COMMON_BUTTON_STYLES =
  "bg-primary hover:bg-primary/90 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300";
const NAV_LINKS = [
  { href: "/", text: "Home" },
  { href: "/orders", text: "Orders" },
  { href: "/products", text: "Products" },
] as const;

const Navbar = ({ initialLoggedIn, isAdmin }: NavbarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useUser();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent, isMobile = false) => {
      e.preventDefault();
      const trimmedSearch = searchTerm.trim();
      if (!trimmedSearch) return; // Prevent empty searches

      const searchUrl = `/products?search=${encodeURIComponent(trimmedSearch)}`;
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
    ({ href, text }: { href: string; text: string }, isMobile = false) => {
      if (isMobile) {
        return (
          <div
            onClick={() => handleDrawerLinkClick(href)}
            className="text-lg font-medium text-gray-700 hover:text-primary transition-all duration-300 relative group cursor-pointer px-2 py-2"
          >
            {text}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </div>
        );
      }

      return (
        <Link
          href={href}
          className="text-base xl:text-lg font-medium text-gray-700 hover:text-primary transition-all duration-300 relative group px-2 py-1"
        >
          {text}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
        </Link>
      );
    },
    [handleDrawerLinkClick]
  );

  const handleLogout = useCallback(() => {
    setLoggedIn(false);
  }, []);

  const renderAuthButton = useCallback(
    (isMobile = false) => {
      if (!loggedIn) {
        return (
          <Button
            className={`${
              isMobile ? "w-full" : "px-6 h-10"
            } ${COMMON_BUTTON_STYLES}`}
            onClick={() =>
              isMobile
                ? handleDrawerLinkClick("/sign-in")
                : router.push("/sign-in")
            }
          >
            Sign In
          </Button>
        );
      }

      const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "";

      return (
        <>
          <Link href="/cart" className={`relative ${isMobile ? "w-full" : ""}`}>
            <Button
              className={`${
                isMobile ? "w-full" : "px-6 h-10"
              } flex items-center justify-center gap-3 ${COMMON_BUTTON_STYLES}`}
            >
              <span>Cart</span>
              <IoCartOutline size={22} />
            </Button>
            <CartCount />
          </Link>
          {!isMobile && (
            <UserDropdown
              onNavigate={router.push}
              isAdmin={isAdmin}
              onLogout={handleLogout}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-white">
                  {initials.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </UserDropdown>
          )}
        </>
      );
    },
    [loggedIn, handleDrawerLinkClick, router, isAdmin, user, handleLogout]
  );

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-md"
          : "bg-white/90 backdrop-blur-md border-b border-gray-100"
      }`}
    >
      <div className="max-w-[2000px] mx-auto flex items-center justify-between py-4 px-4 md:px-8 lg:px-12 xl:px-20">
        <Link
          href="/"
          className="transform hover:scale-105 transition duration-300"
        >
          <Image
            src={logo}
            alt="Logo"
            width={150}
            height={120}
            className="w-28 md:w-32 lg:w-36"
            priority
          />
        </Link>

        <div className="hidden lg:flex items-center gap-2 max-w-xl relative">
          <NavSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSubmit={handleSearch}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) =>
              loggedIn || link.href !== "/orders" ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base xl:text-lg font-medium text-gray-700 hover:text-primary transition-all duration-300 relative group px-2 py-1"
                >
                  {link.text}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              ) : null
            )}
            {renderAuthButton()}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {loggedIn && (
              <UserDropdown
                onNavigate={router.push}
                isAdmin={isAdmin}
                onLogout={handleLogout}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white">
                    {user
                      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                      : ""}
                  </AvatarFallback>
                </Avatar>
              </UserDropdown>
            )}

            <Drawer
              direction="left"
              open={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 hover:bg-gray-50 border-gray-200 transition-all duration-300 transform hover:scale-105"
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
                        className="h-11 w-11 hover:bg-gray-50 border-gray-200 transition-all duration-300 transform hover:scale-105"
                        onClick={closeDrawer}
                      >
                        <IoMdClose size={24} className="text-gray-700" />
                      </Button>
                    </DrawerClose>
                  </DrawerTitle>
                </DrawerHeader>
                <div className="px-6 py-4">
                  <NavSearch
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSubmit={handleSearch}
                    isMobile
                  />
                </div>
                <div className="flex flex-col gap-6 px-6">
                  {NAV_LINKS.map((link) =>
                    loggedIn || link.href !== "/orders" ? (
                      <div
                        key={link.href}
                        onClick={() => handleDrawerLinkClick(link.href)}
                        className="text-lg font-medium text-gray-700 hover:text-primary transition-all duration-300 relative group cursor-pointer px-2 py-2"
                      >
                        {link.text}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
                      </div>
                    ) : null
                  )}
                </div>
                <DrawerFooter>{renderAuthButton(true)}</DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

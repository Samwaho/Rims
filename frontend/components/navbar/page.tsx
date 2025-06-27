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
  IoHomeOutline,
  IoBagOutline,
  IoReceiptOutline,
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
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import { Badge } from "../ui/badge";

interface NavbarProps {
  initialLoggedIn: boolean;
  isAdmin?: boolean;
}

const COMMON_BUTTON_STYLES =
  "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 rounded-xl";
const NAV_LINKS = [
  { href: "/", text: "Home", icon: IoHomeOutline },
  { href: "/orders", text: "Orders", icon: IoReceiptOutline },
  { href: "/products", text: "Products", icon: IoBagOutline },
] as const;

const Navbar = ({ initialLoggedIn, isAdmin }: NavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user } = useUser();

  // Handle scroll effect with enhanced blur and shadow
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent, isMobile = false) => {
      e.preventDefault();
      const trimmedSearch = searchTerm.trim();
      if (!trimmedSearch) return;

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

  const isActiveLink = useCallback(
    (href: string) => {
      if (href === "/") {
        return pathname === "/";
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const renderNavLink = useCallback(
    ({ href, text, icon: Icon }: { href: string; text: string; icon: any }, isMobile = false) => {
      const isActive = isActiveLink(href);
      
      if (isMobile) {
        return (
          <div
            onClick={() => handleDrawerLinkClick(href)}
            className={`flex items-center gap-3 text-lg font-medium transition-all duration-300 relative group cursor-pointer px-4 py-3 rounded-xl ${
              isActive
                ? "text-primary bg-primary/10 border border-primary/20"
                : "text-gray-700 hover:text-primary hover:bg-gray-50"
            }`}
          >
            <Icon size={20} className={isActive ? "text-primary" : "text-gray-500"} />
            {text}
            {isActive && (
              <div className="absolute right-3 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </div>
        );
      }

      return (
        <Link
          href={href}
          className={`flex items-center gap-2 text-base xl:text-lg font-medium transition-all duration-300 relative group px-3 py-2 rounded-lg ${
            isActive
              ? "text-primary bg-primary/10"
              : "text-gray-700 hover:text-primary hover:bg-gray-50"
          }`}
        >
          <Icon size={18} className={isActive ? "text-primary" : "text-gray-500"} />
          {text}
          {isActive && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
          )}
        </Link>
      );
    },
    [handleDrawerLinkClick, isActiveLink]
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
              isMobile ? "w-full" : "px-8 h-11"
            } ${COMMON_BUTTON_STYLES}`}
            onClick={() =>
              isMobile
                ? handleDrawerLinkClick("/sign-in")
                : router.push("/sign-in")
            }
          >
            <IoPersonOutline size={18} className="mr-2" />
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
                isMobile ? "w-full" : "px-6 h-11"
              } flex items-center justify-center gap-3 ${COMMON_BUTTON_STYLES}`}
            >
              <span>Cart</span>
              <IoCartOutline size={20} />
            </Button>
            <CartCount />
          </Link>
          {!isMobile && (
            <UserDropdown
              onNavigate={router.push}
              isAdmin={isAdmin}
              onLogout={handleLogout}
            >
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
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
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/85 backdrop-blur-xl shadow-lg border-b border-gray-200/50"
          : "bg-white/95 backdrop-blur-md border-b border-gray-100/50"
      }`}
    >
      <div className="max-w-[2000px] mx-auto flex items-center justify-between py-3 px-4 md:px-8 lg:px-12 xl:px-20">
        {/* Logo */}
        <Link
          href="/"
          className="transform hover:scale-105 transition duration-300 group"
        >
          <div className="relative">
            <Image
              src={logo}
              alt="Jara Wheels Logo"
              width={70}
              height={70}
              className="w-16 md:w-20 lg:w-20 transition-all duration-300 group-hover:drop-shadow-lg"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 rounded-lg transition-all duration-300" />
          </div>
        </Link>

        {/* Desktop Search */}
        <div className="hidden lg:flex items-center gap-2 max-w-xl relative">
          <NavSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSubmit={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            isFocused={isSearchFocused}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) =>
              loggedIn || link.href !== "/orders" ? (
                <div key={link.href}>
                  {renderNavLink(link)}
                </div>
              ) : null
            )}
            {renderAuthButton()}
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-3 lg:hidden">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-gray-100 border border-gray-200 transition-all duration-300"
              onClick={() => setIsDrawerOpen(true)}
            >
              <IoSearchOutline size={20} className="text-gray-600" />
            </Button>

            {/* Mobile User Avatar */}
            {loggedIn && (
              <UserDropdown
                onNavigate={router.push}
                isAdmin={isAdmin}
                onLogout={handleLogout}
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                    {user
                      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                      : ""}
                  </AvatarFallback>
                </Avatar>
              </UserDropdown>
            )}

            {/* Mobile Menu Button */}
            <Drawer
              direction="left"
              open={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 hover:bg-gray-50 border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  <IoMenu size={22} className="text-gray-700" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-gradient-to-br from-gray-50 via-white to-gray-50 h-screen w-80 pt-safe-top">
                <DrawerHeader className="mt-6 px-6">
                  <DrawerTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Image
                        src={logo}
                        alt="Logo"
                        width={100}
                        height={100}
                        className="w-16 md:w-20"
                        priority
                      />
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900">Jara Wheels</span>
                        <span className="text-xs text-gray-500">Premium Wheels & Tires</span>
                      </div>
                    </div>
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 hover:bg-gray-50 border-gray-200 transition-all duration-300 transform hover:scale-105"
                        onClick={closeDrawer}
                      >
                        <IoMdClose size={20} className="text-gray-700" />
                      </Button>
                    </DrawerClose>
                  </DrawerTitle>
                </DrawerHeader>

                {/* Mobile Search */}
                <div className="px-6 py-4">
                  <NavSearch
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSubmit={handleSearch}
                    isMobile
                  />
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-2 px-6 py-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">
                    Navigation
                  </div>
                  {NAV_LINKS.map((link) =>
                    loggedIn || link.href !== "/orders" ? (
                      <div key={link.href}>
                        {renderNavLink(link, true)}
                      </div>
                    ) : null
                  )}
                </div>

                {/* Mobile User Section */}
                {loggedIn && (
                  <div className="px-6 py-4 border-t border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Account
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                          {user
                            ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                            : ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-gray-900 truncate">
                          {user ? `${user.firstName} ${user.lastName}` : "User"}
                        </span>
                        <span className="text-sm text-gray-500 truncate">
                          {user?.email || "user@example.com"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Auth Buttons */}
                <DrawerFooter className="px-6 py-6">
                  {renderAuthButton(true)}
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

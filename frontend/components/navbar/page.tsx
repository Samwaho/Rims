import Image from "next/image";
import React from "react";
import logo from "@/public/Logo.png";
import { IoCartOutline, IoMenu } from "react-icons/io5";
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

const Navbar = async () => {
  const user = await getAuthUser();
  const loggedIn = !!user;

  return (
    <nav className="flex items-center justify-between py-4 px-4 md:px-6 lg:px-8">
      <Link href="/">
        <Image
          src={logo}
          alt="Logo"
          width={120}
          height={80}
          className="w-24 md:w-28 lg:w-32"
        />
      </Link>
      <Input
        type="text"
        placeholder="Search"
        className="hidden lg:flex items-center gap-4 max-w-xl"
      />
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-6">
          <Link href="/" className="text-lg xl:text-xl hover:text-gray-600">
            Home
          </Link>
          <Link
            href="/products"
            className="text-lg xl:text-xl hover:text-gray-600"
          >
            Products
          </Link>
          <Link
            href="/categories"
            className="text-lg xl:text-xl hover:text-gray-600"
          >
            Categories
          </Link>
          <Link
            href="/contact"
            className="text-lg xl:text-xl hover:text-gray-600"
          >
            Contact
          </Link>
          {loggedIn ? (
            <Link href="/cart">
              <Button className="px-2 w-20 h-8 text-sm xl:w-24 xl:h-10 xl:text-base flex items-center gap-2">
                <span>Cart</span>
                <IoCartOutline size={20} />
              </Button>
            </Link>
          ) : (
            <Link href="/sign-in">
              <Button className="px-2 w-20 h-8 text-sm xl:w-24 xl:h-10 xl:text-base">
                Sign In
              </Button>
            </Link>
          )}
        </div>
        <Drawer direction="left">
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <IoMenu size={24} className="text-gray-800" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-gradient-to-tl from-gray-300 to-white h-screen w-80">
            <DrawerHeader>
              <DrawerTitle className="flex justify-between items-center">
                <Image
                  src={logo}
                  alt="Logo"
                  width={120}
                  height={80}
                  className="w-24 md:w-28"
                />
                <DrawerClose asChild>
                  <Button variant="outline" size="icon">
                    <IoMdClose size={24} className="text-gray-800" />
                  </Button>
                </DrawerClose>
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-6 mt-8 px-6">
              <Link href="/" className="text-xl hover:text-gray-600">
                Home
              </Link>
              <Link href="/products" className="text-xl hover:text-gray-600">
                Products
              </Link>
              <Link href="/categories" className="text-xl hover:text-gray-600">
                Categories
              </Link>
              <Link href="/contact" className="text-xl hover:text-gray-600">
                Contact
              </Link>
            </div>
            <DrawerFooter>
              {!loggedIn ? (
                <Link href="/sign-in">
                  <Button className="w-full">Sign In</Button>
                </Link>
              ) : (
                <Link href="/cart">
                  <Button className="w-full mt-4 flex items-center justify-center gap-2">
                    <span>Cart</span>
                    <IoCartOutline size={20} />
                  </Button>
                </Link>
              )}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
};

export default Navbar;

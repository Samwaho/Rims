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

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between py-4 ">
      <Image
        src={logo}
        alt="Logo"
        width={120}
        height={80}
        className="w-24 md:w-28 lg:w-32"
      />
      <Input
        type="text"
        placeholder="Search"
        className="hidden lg:flex items-center gap-4 max-w-xl"
      />
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex gap-6">
            <h4 className="text-lg xl:text-xl hover:text-gray-600 cursor-pointer">
              Home
            </h4>
            <h4 className="text-lg xl:text-xl hover:text-gray-600 cursor-pointer">
              About
            </h4>
            <h4 className="text-lg xl:text-xl hover:text-gray-600 cursor-pointer">
              Blog
            </h4>
          </div>

          <Button className="px-2 w-20 h-8 text-sm xl:w-24 xl:h-10 xl:text-base">
            <p>Cart</p>
            <IoCartOutline size={20} />
          </Button>
        </div>
        <Drawer direction="left">
          <DrawerTrigger className="lg:hidden">
            <IoMenu size={32} className="text-gray-800" />
          </DrawerTrigger>
          <DrawerContent className="h-screen w-[80%] sm:w-[60%] md:w-[50%]">
            <DrawerHeader>
              <DrawerTitle className="flex justify-between items-center">
                <Image
                  src={logo}
                  alt="Logo"
                  width={120}
                  height={80}
                  className="w-24 md:w-28"
                />
                <DrawerClose>
                  <IoMdClose size={24} className="text-gray-800" />
                </DrawerClose>
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-6 mt-8 px-6">
              <h4 className="text-xl hover:text-gray-600 cursor-pointer">
                Home
              </h4>
              <h4 className="text-xl hover:text-gray-600 cursor-pointer">
                About
              </h4>
              <h4 className="text-xl hover:text-gray-600 cursor-pointer">
                Blog
              </h4>
            </div>
            <DrawerFooter>
              <Button className="w-full">Login</Button>
              <Button className="w-full mt-4">
                <p>Cart</p>
                <IoCartOutline size={20} className="ml-2" />
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
};

export default Navbar;

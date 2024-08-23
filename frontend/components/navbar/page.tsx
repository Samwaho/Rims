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

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between py-4">
      <Image src={logo} alt="Logo" width={120} height={80} />
      <div className="flex items-center gap-4">
        <Button className="px-2 w-16 h-6 text-sm">
          <p>Cart</p>
          <IoCartOutline size={20} />
        </Button>
        <Drawer direction="left">
          <DrawerTrigger>
            <IoMenu size={40} />
          </DrawerTrigger>
          <DrawerContent className="h-screen bg-slate-100 w-[80%]">
            <DrawerHeader>
              <DrawerTitle className="flex justify-between">
                <Image src={logo} alt="Logo" width={150} height={80} />
                <DrawerClose className="">
                  <IoMdClose size={25} />
                </DrawerClose>
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-4 mt-4 px-4">
              <h4 className="text-xl">Home</h4>
              <h4 className="text-xl">About</h4>
              <h4 className="text-xl">Blog</h4>
            </div>
            <DrawerFooter>
              <Button>Login</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
};

export default Navbar;

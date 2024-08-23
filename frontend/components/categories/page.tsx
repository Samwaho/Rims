import React from "react";
import TiresCat from "@/public/TIresCat.png";
import WheelsCat from "@/public/WheelsCat.png";
import Image from "next/image";
import { Button } from "../ui/button";

const Categories = () => {
  return (
    <section className="flex items-center gap-4 mt-4">
      <div className="flex flex-col bg-gray-200 p-2 shadow-sm rounded-md">
        <h2 className="font-bold text-lg text-center">Tires</h2>
        <Image src={TiresCat} alt="Tires" width={200} height={150} />
        <Button className="h-6 w-20">More Info</Button>
      </div>
      <div className="flex flex-col bg-gray-200 p-2 shadow-sm rounded-md">
        <h2 className="font-bold text-lg text-center">Rims</h2>
        <Image src={WheelsCat} alt="Tires" width={200} height={150} />
        <Button className="h-6 w-20">More Info</Button>
      </div>
    </section>
  );
};

export default Categories;

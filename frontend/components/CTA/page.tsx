import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const CTA = () => {
  return (
    <section className="bgImg p-6 mt-6">
      <p className="text-center text-white text-sm">
        Sign up and get Updated on Discount Offers
      </p>
      <div className="flex mt-6">
        <Input
          className="rounded-e-none"
          type="email"
          placeholder="Enter your email"
        />
        <Button className="rounded-s-none">Subscribe</Button>
      </div>
    </section>
  );
};

export default CTA;

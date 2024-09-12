"use client";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const CTA = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log("Subscribing with email:", email);
    // Reset email field after submission
    setEmail("");
  };

  return (
    <section className="bgImg p-6 mt-10 h-[300px] flex flex-col justify-center shadow-md">
      <h2 className="text-center text-white text-xl font-bold mb-2">
        Stay Updated on Discount Offers
      </h2>
      <p className="text-center text-white text-sm mb-4">
        Sign up for our newsletter to receive exclusive deals and promotions
      </p>
      <form onSubmit={handleSubmit} className="flex max-w-xl mx-auto">
        <Input
          className="rounded-e-none flex-grow"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="rounded-s-none">
          Subscribe
        </Button>
      </form>
    </section>
  );
};

export default CTA;

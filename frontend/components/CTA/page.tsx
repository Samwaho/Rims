"use client";
import { memo, useState, useCallback } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const CTA = memo(() => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setEmail("");
      } catch (error) {
        console.error("Newsletter subscription failed:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    []
  );

  return (
    <section className="bgImg p-8 md:p-12 mt-10 min-h-[350px] flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full">
        <h2 className="text-center text-white text-2xl md:text-3xl font-bold mb-3">
          Get Exclusive Tire & Wheel Deals
        </h2>
        <p className="text-center text-gray-300 text-sm md:text-base mb-6 max-w-md mx-auto">
          Join our newsletter and receive special offers, new product updates,
          and expert advice directly in your inbox
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
        >
          <Input
            className="flex-grow rounded-lg"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={handleEmailChange}
            required
            disabled={loading}
            aria-label="Email address"
          />
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70"
            disabled={loading}
            aria-label={loading ? "Subscribing..." : "Subscribe to newsletter"}
          >
            {loading ? "Subscribing..." : "Subscribe Now"}
          </Button>
        </form>
        <p className="text-center text-gray-400 text-xs mt-4">
          By subscribing, you agree to receive marketing communications from us.
          You can unsubscribe at any time.
        </p>
      </div>
    </section>
  );
});

CTA.displayName = "CTA";

export default CTA;

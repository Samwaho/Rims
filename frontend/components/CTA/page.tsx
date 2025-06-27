"use client";
import { memo, useState, useCallback } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const CTA_BG =
  "https://images.unsplash.com/photo-1644749700856-a82a92828a1b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FyJTIwc2hvd3Jvb218ZW58MHx8MHx8fDA%3D"; // High-quality car Unsplash image

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
    <section
      className="relative w-full min-h-[350px] md:min-h-[400px] flex items-center justify-center my-12 rounded-2xl overflow-hidden shadow-xl"
      style={{ backgroundImage: `url('${CTA_BG}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 opacity-90" />
      <div className="relative z-10 w-full max-w-2xl px-4 py-12 flex flex-col items-center justify-center">
        <h2 className="text-center text-white text-3xl md:text-4xl font-extrabold mb-3 drop-shadow-lg">
          Get Exclusive Car, Rim, Tyre & Accessory Deals
        </h2>
        <p className="text-center text-gray-200 text-base md:text-lg mb-7 max-w-lg mx-auto font-medium">
          Join our newsletter for special offers, new arrivals, and expert tips on <span className="font-bold text-white">rims, offroad rims, tyres, accessories, and cars</span>. Be the first to know and elevate your ride!
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto"
        >
          <Input
            className="flex-grow rounded-lg border-2 border-white/30 bg-white/80 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition"
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
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-2 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70"
            disabled={loading}
            aria-label={loading ? "Subscribing..." : "Subscribe to newsletter"}
          >
            {loading ? "Subscribing..." : "Subscribe Now"}
          </Button>
        </form>
        <p className="text-center text-gray-300 text-xs mt-5 max-w-md mx-auto">
          By subscribing, you agree to receive marketing communications from us. You can unsubscribe at any time.
        </p>
      </div>
    </section>
  );
});

CTA.displayName = "CTA";

export default CTA;

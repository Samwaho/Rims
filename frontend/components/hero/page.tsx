import Link from "next/link";
import { Star, Shield, Zap } from "lucide-react";

const HERO_BG =
  "https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fGNhcnN8ZW58MHx8MHx8fDA%3D";

const badges = [
  { icon: Star, text: "Premium Quality" },
  { icon: Shield, text: "Lifetime Warranty" },
  { icon: Zap, text: "Fast Delivery" },
];

export default function Hero() {
  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-center bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url('${HERO_BG}')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 py-16">
        {/* Badges */}
        <div className="flex flex-wrap gap-3 mb-6">
          {badges.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium text-gray-800 shadow"
            >
              <Icon className="w-4 h-4 text-primary" />
              {text}
            </span>
          ))}
        </div>
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white text-center mb-4 drop-shadow-lg">
          Find Your Perfect <span className="text-primary">Wheels</span>
        </h1>
        {/* Subheadline */}
        <p className="max-w-2xl text-center text-lg md:text-xl text-white/90 mb-8 font-medium">
          Discover our curated collection of premium <span className="font-bold text-white">rims, tyres, accessories, and cars</span>. Experience unmatched quality, style, and performance with every mile.
        </p>
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-semibold bg-primary text-white shadow-lg hover:bg-primary/90 transition"
          >
            Shop Now
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-semibold bg-white/90 text-primary shadow-lg hover:bg-white transition"
          >
            Contact Us
          </Link>
        </div>
        {/* Social Proof */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex -space-x-2 mb-1">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-primary/30"
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <span className="font-semibold text-primary">Join 2,000+ satisfied customers</span>
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1 text-xs text-white/70">(4.9/5)</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

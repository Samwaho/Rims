import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us | Jara Wheels",
  description: "Learn more about Jara Wheels and our mission",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">About Jara Wheels</h1>

      <div className="prose prose-slate max-w-none">
        <section className="mb-12">
          <div className="relative w-full h-[300px] mb-8 rounded-lg overflow-hidden">
            <Image
              src="/wheelshublogo.png"
              alt="Jara Wheels Store"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="mb-4">
            Founded in 2024, Jara Wheels has been at the forefront of
            providing high-quality wheels and tyres to car enthusiasts and
            everyday drivers alike. Our journey began with a simple mission: to
            make premium automotive products accessible to everyone.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="mb-4">
            At Jara Wheels, we're committed to delivering exceptional quality,
            outstanding service, and expert advice to help our customers find
            the perfect wheels and tyres for their vehicles.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Why Choose Us</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Wide selection of premium wheels and tyres</li>
            <li>Expert advice and customer support</li>
            <li>Competitive pricing</li>
            <li>Quality guaranteed products</li>
            <li>Professional installation services</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

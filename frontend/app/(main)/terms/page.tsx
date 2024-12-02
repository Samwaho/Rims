import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Jara Wheels",
  description: "Terms and conditions for using Jara Wheels services",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

      <div className="prose prose-slate max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="mb-4">
            By accessing and using Jara Wheels website and services, you accept
            and agree to be bound by the terms and conditions outlined here.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Use of Service</h2>
          <p className="mb-4">
            You agree to use our service only for lawful purposes and in
            accordance with these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Product Information
          </h2>
          <p className="mb-4">
            We strive to provide accurate product information but cannot
            guarantee the availability, pricing, or specifications of any
            products.
          </p>
        </section>

        {/* Add more sections as needed */}
      </div>
    </div>
  );
}

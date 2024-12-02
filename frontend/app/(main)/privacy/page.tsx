import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Jara Wheels",
  description: "Privacy policy for Jara Wheels services",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <div className="prose prose-slate max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Information We Collect
          </h2>
          <p className="mb-4">
            We collect information that you provide directly to us, including
            but not limited to your name, email address, and shipping
            information when you make a purchase.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. How We Use Your Information
          </h2>
          <p className="mb-4">
            We use the information we collect to process your orders,
            communicate with you about our products and services, and improve
            our website experience.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Information Sharing
          </h2>
          <p className="mb-4">
            We do not sell or share your personal information with third parties
            except as necessary to provide our services or as required by law.
          </p>
        </section>

        {/* Add more sections as needed */}
      </div>
    </div>
  );
}

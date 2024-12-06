import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Jara Wheels",
  description: "Get in touch with Jara Wheels",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-gray-600 mb-4">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-gray-600">info@jarawheels.com</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors duration-200"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

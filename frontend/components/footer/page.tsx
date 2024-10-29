import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#303030] text-white p-6 md:py-12 w-full mt-6">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Main footer content */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm mb-12">
            <div className="grid gap-2">
              <h3 className="font-bold text-lg mb-2">Company</h3>
              <Link
                href="#"
                prefetch={false}
                className="hover:text-red-400 transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                href="#"
                prefetch={false}
                className="hover:text-red-400 transition-colors duration-200"
              >
                Contact
              </Link>
            </div>
            <div className="grid gap-2">
              <h3 className="font-bold text-lg mb-2">Products</h3>
              <Link
                href="#"
                prefetch={false}
                className="hover:text-red-400 transition-colors duration-200"
              >
                Tyres
              </Link>
              <Link
                href="#"
                prefetch={false}
                className="hover:text-red-400 transition-colors duration-200"
              >
                Wheels
              </Link>
            </div>
            <div className="grid gap-2">
              <h3 className="font-bold text-lg mb-2">Legal</h3>
              <Link
                href="#"
                prefetch={false}
                className="hover:text-red-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                prefetch={false}
                className="hover:text-red-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Bottom bar with copyright */}
          <div className="pt-8 border-t border-gray-600 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} WheelsHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

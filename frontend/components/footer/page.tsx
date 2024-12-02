import { memo } from "react";
import Link from "next/link";

const FooterLink = memo(
  ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      prefetch={false}
      className="hover:text-primary/80 transition-colors duration-200"
    >
      {children}
    </Link>
  )
);

FooterLink.displayName = "FooterLink";

const FooterSection = memo(
  ({
    title,
    links,
  }: {
    title: string;
    links: { href: string; text: string }[];
  }) => (
    <div className="grid gap-2">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      {links.map(({ href, text }) => (
        <FooterLink key={text} href={href}>
          {text}
        </FooterLink>
      ))}
    </div>
  )
);

FooterSection.displayName = "FooterSection";

const Footer = memo(() => {
  const sections = [
    {
      title: "Company",
      links: [
        { href: "/about", text: "About Us" },
        { href: "/contact", text: "Contact" },
      ],
    },
    {
      title: "Products",
      links: [
        { href: "/products", text: "Tyres" },
        { href: "/products", text: "Wheels" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", text: "Privacy Policy" },
        { href: "/terms", text: "Terms of Service" },
      ],
    },
  ];

  return (
    <footer className="bg-[#303030] text-white p-6 md:py-12 w-full mt-6">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Main footer content */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm mb-12">
            {sections.map((section) => (
              <FooterSection key={section.title} {...section} />
            ))}
          </div>

          {/* Bottom bar with copyright */}
          <div className="pt-8 border-t border-gray-600 text-center text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} Jara Wheels. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;

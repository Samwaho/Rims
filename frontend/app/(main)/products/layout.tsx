import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | Jara Wheels",
  description: "Browse our collection of products",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

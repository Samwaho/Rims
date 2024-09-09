import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";

// Define the Product interface based on the model
interface Specification {
  name: string;
  value: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: "general" | "wheel" | "rim";
  brand: string;
  specifications: Specification[];
  createdAt: string;
  updatedAt: string;
}

// Update the getProduct function to include new fields
async function getProduct(id: string): Promise<Product> {
  // Implement API call here
  // For now, return mock data with additional fields
  return {
    _id: id,
    name: 'Acme Alloy Wheels - 18" Gunmetal',
    description:
      'The Acme Alloy Wheels - 18" Gunmetal are a premium set of wheels designed for the modern automotive enthusiast. Crafted from high-quality alloy, these wheels offer a perfect blend of strength, style, and performance.',
    price: 39999,
    stock: 10,
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
    ],
    category: "wheel",
    brand: "Acme Wheels",
    specifications: [
      { name: "Wheel Size", value: "18 inches" },
      { name: "Bolt Pattern", value: "5x114.3" },
      { name: "Offset", value: "+35mm" },
      { name: "Finish", value: "Gunmetal" },
      { name: "Weight", value: "10 kg" },
      { name: "Load Rating", value: "680 kg" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default async function ProductPage({
  params,
}: {
  params: { product: string };
}) {
  const product = await getProduct(params.product);

  return (
    <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start max-w-6xl px-4 mx-auto py-6">
      <div className="grid gap-4 md:gap-10 items-start">
        <div className="grid gap-4">
          <Image
            src={product.images[0]}
            alt={`${product.name} - Main Image`}
            width={600}
            height={600}
            className="aspect-square object-cover border w-full rounded-lg overflow-hidden"
          />
          <div className="hidden md:flex gap-4 items-start">
            {product.images.slice(1).map((image, index) => (
              <button
                key={index}
                className="border hover:border-primary rounded-lg overflow-hidden transition-colors"
              >
                <Image
                  src={image}
                  alt={`${product.name} - Image ${index + 2}`}
                  width={100}
                  height={100}
                  className="aspect-square object-cover"
                />
                <span className="sr-only">View Image {index + 2}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:gap-10 items-start">
        <div className="grid gap-4">
          <h1 className="font-bold text-3xl lg:text-4xl">{product.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 ${
                    i < 3
                      ? "fill-primary"
                      : "fill-muted stroke-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">(12 reviews)</div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Brand:</span>
              <span>{product.brand}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Category:</span>
              <span>{product.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Price:</span>
              <span className="text-4xl font-bold">
                {formatPrice(product.price)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Availability:</span>
              <Badge
                variant="outline"
                className={`${
                  product.stock > 0
                    ? "bg-green-500 text-green-50"
                    : "bg-red-500 text-red-50"
                }`}
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
          </div>
          <div className="grid gap-4">
            <p>{product.description}</p>
            <Button size="lg">Add to Cart</Button>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <h2 className="font-bold text-2xl">Product Specifications</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Specification</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.specifications.map((spec, index) => (
                <TableRow key={index}>
                  <TableCell>{spec.name}</TableCell>
                  <TableCell>{spec.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

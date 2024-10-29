export interface Specification {
  name: string;
  value: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: "general" | "wheel" | "rim";
  brand: string;
  madeIn: string;
  specifications: Specification[];
  createdAt: string;
  updatedAt: string;
  reviews: Review[];
  numReviews: number;
  averageRating: number;
}

export interface Review {
  _id: string;
  user: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface FilterState {
  brand: string[];
  category: string[];
  priceRange?: [number, number];
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  images: string[];
  brand: string;
  madeIn: string;
  specifications: Array<Specification>;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  reviews: any[];
  numReviews: number;
}

export interface FilterState {
  brand: string[];
  category: string[];
  priceRange?: [number, number];
}

export interface Specification {
  name: string;
  value: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "user";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    county?: string;
    postalCode?: string;
  };
}

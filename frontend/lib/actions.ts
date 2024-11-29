"use server";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const setCookies = async (token: string) => {
  try {
    cookies().set("access_token", token, {
      path: "/",
      httpOnly: true,
    });
  } catch (error) {
    console.error("🚀 ~ setCookies ~ error:", error);
  }
};

export const axiosHeaders = async (): Promise<{
  headers: { Authorization: string };
}> => {
  return {
    headers: {
      Authorization: `Bearer ${cookies().get("access_token")?.value}`,
    },
  };
};

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
}

export const getAuthUser = async (): Promise<AuthUser | null> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/user`,
      await axiosHeaders()
    );
    return response.data;
  } catch (error: any) {
    console.error("getAuthUser error:", error?.message || error);
    return null;
  }
};

export const isAdmin = (user: AuthUser | null): boolean => {
  return user?.role === "admin";
};

export const requireAuth = async (requiredRole?: "admin" | "user") => {
  const user = await getAuthUser();
  if (!user) {
    redirect("/sign-in");
  }
  if (requiredRole && user.role !== requiredRole) {
    redirect("/");
  }
  return user;
};

export const requireAdmin = async () => {
  const user = await requireAuth("admin");
  return user;
};

export const logout = async () => {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`,
      {},
      await axiosHeaders()
    );
    cookies().delete("access_token");
    redirect("/");
  } catch (error: any) {
    console.error("logout error:", error?.message || error);
  }
};

export const getUserPaymentDetails = async (): Promise<{
  email: string;
  firstName: string;
  lastName: string;
} | null> => {
  try {
    const user = await getAuthUser();
    if (!user) return null;

    return {
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    };
  } catch (error: any) {
    console.error("getUserPaymentDetails error:", error?.message || error);
    return null;
  }
};

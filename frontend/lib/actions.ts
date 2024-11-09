"use server";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Constants
const AUTH_COOKIE_NAME = "access_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const AUTH_USER_ENDPOINT = `${API_BASE_URL}/api/auth/user`;

// Helper function to get auth token
const getAuthToken = (): string | undefined => {
  return cookies().get(AUTH_COOKIE_NAME)?.value;
};

// Helper function to create auth headers
const createAuthHeaders = (token: string | undefined) => ({
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
});

export const setCookies = async (token: string) => {
  try {
    cookies().set(AUTH_COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } catch (error) {
    console.error("[Cookie Error]:", error);
    throw new Error("Failed to set authentication cookie");
  }
};

export const axiosHeaders = () => {
  const token = getAuthToken();
  return createAuthHeaders(token);
};

export const getAuthUser = async () => {
  try {
    const token = getAuthToken();
    const headers = createAuthHeaders(token);
    const { data } = await axios.get(AUTH_USER_ENDPOINT, headers);
    return data;
  } catch (error) {
    console.error(
      "[Auth Error]:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
};

export const requireAuth = async () => {
  const user = await getAuthUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
};

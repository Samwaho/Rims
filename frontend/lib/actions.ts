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

export const getAuthUser = async () => {
  try {
    const user = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/user`,
      await axiosHeaders()
    );
    return user.data;
  } catch (error: any) {
    console.error("getAuthUser error:", error?.message || error);
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

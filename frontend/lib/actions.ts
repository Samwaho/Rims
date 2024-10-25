"use server";
import axios from "axios";
import { cookies } from "next/headers";

export const setCookies = async (token: string) => {
  try {
    cookies().set("access_token", token, {
      path: "/",
      httpOnly: true,
    });
  } catch (error) {
    console.log("🚀 ~ setCookies ~ error:", error);
  }
};

export const axiosHeaders = () => {
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
      {
        headers: {
          Authorization: `Bearer ${cookies().get("access_token")?.value}`,
        },
      }
    );
    return user.data;
  } catch (error) {
    console.log("🚀 ~ getAuthUser ~ error:", error);
  }
};

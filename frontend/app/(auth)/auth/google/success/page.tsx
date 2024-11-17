"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookies } from "@/lib/actions";

export default function GoogleAuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Use the server action to set the cookie
      setCookies(token)
        .then(() => {
          // Redirect to home or dashboard after cookie is set
          router.push("/");
        })
        .catch((error) => {
          console.error("Failed to set cookie:", error);
          router.push("/sign-in?error=auth_failed");
        });
    } else {
      // Handle error case
      router.push("/sign-in?error=auth_failed");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Logging you in...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}

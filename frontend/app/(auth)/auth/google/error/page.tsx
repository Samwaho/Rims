"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleAuthError() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to sign-in page after a short delay
    const timeout = setTimeout(() => {
      router.push("/sign-in?error=google_auth_failed");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">
          Authentication Failed
        </h1>
        <p className="text-gray-600">
          There was an error signing in with Google. Redirecting you back...
        </p>
      </div>
    </div>
  );
}

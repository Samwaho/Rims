"use client";

import { Button } from "./ui/button";
import { FcGoogle } from "react-icons/fc";

export const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`;
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      className="w-full h-11 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-all duration-200"
    >
      <FcGoogle className="w-5 h-5" />
      Continue with Google
    </Button>
  );
};

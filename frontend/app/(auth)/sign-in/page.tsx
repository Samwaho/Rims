import SignInForm from "@/components/forms/signIn-form";
import React from "react";

const SignIn = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tl from-gray-300 to-white">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>
        <SignInForm />
      </div>
    </div>
  );
};

export default SignIn;

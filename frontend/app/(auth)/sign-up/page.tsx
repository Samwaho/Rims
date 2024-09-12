import SignUpForm from "@/components/forms/signUp-form";
import React from "react";

const SignUp = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tl from-gray-300 to-white">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;

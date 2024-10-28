import SignInForm from "@/components/forms/signIn-form";
import React from "react";

const SignIn = () => {
  return (
    <div className="w-full max-w-xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
      </div>
      <SignInForm />
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          Having trouble signing in?{" "}
          <a
            href="#"
            className="text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;

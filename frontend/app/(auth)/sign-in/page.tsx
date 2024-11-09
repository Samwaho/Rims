import SignInForm from "@/components/forms/signIn-form";
import React from "react";

const SignIn = () => {
  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-4">
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

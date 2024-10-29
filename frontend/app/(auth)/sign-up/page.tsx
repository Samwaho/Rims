import SignUpForm from "@/components/forms/signUp-form";
import React from "react";

const SignUp = () => {
  return (
    <div className="w-full max-w-xl mx-auto px-2 py-2 sm:px-2 lg:px-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-900">
            Create Your Account
          </h1>
          <p className="text-center text-gray-600 text-sm md:text-base">
            Join us to start managing your inventory efficiently
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;

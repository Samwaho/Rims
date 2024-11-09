import SignUpForm from "@/components/forms/signUp-form";
import React from "react";

const SignUp = () => {
  return (
    <div className="w-full max-w-xl mx-auto px-2 py-2 sm:px-2 lg:px-8">
      <div className="space-y-4">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;

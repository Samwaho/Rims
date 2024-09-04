import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, mailtrapSender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationCode) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: mailtrapSender,
      to: recipient,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationCode
      ),
      category: "Email Verification",
    });
    console.log("Verification email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

export const sendResetEmail = async (email, resetToken) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: mailtrapSender,
      to: recipient,
      subject: " Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetToken}", resetToken),
      category: "Password Reset",
    });
    console.log("Reset email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending reset email:", error);
    return false;
  }
};

export const sendPasswordResetSuccessEmail = async (email) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: mailtrapSender,
      to: recipient,
      subject: "Password Reset Success",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });
    console.log("Password reset success email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    return false;
  }
};

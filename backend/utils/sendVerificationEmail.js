import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, mailtrapSender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationCode) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: mailtrapSender,
      to: recipient,
      subject: "Rims: Verify Your Email",
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

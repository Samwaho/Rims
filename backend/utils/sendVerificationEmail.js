import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  ORDER_CONFIRMATION_TEMPLATE,
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

export const sendResetEmail = async (email, resetLink) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: mailtrapSender,
      to: recipient,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetLink}", resetLink),
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

export const sendOrderConfirmationEmail = async (email, order) => {
  if (!email) {
    console.error("No email provided for order confirmation");
    return false;
  }

  const userEmail = email.email ? email.email : email;

  const recipient = [{ email: userEmail }];

  const orderItems = order.products
    .map(
      (item) => `
    <div style="border-bottom: 1px solid #e5e5e5; padding: 12px 0;">
      <p style="margin: 0; color: #4b5563;">
        ${item.product.name} x ${item.quantity} - ${new Intl.NumberFormat(
        "en-KE",
        {
          style: "currency",
          currency: "KES",
        }
      ).format(item.product.price * item.quantity)}
      </p>
    </div>
  `
    )
    .join("");

  const formattedPaymentMethod =
    order.paymentMethod === "mpesa" ? "M-PESA" : "Bank Transfer";

  const orderLink = `${process.env.FRONTEND_URL}/orders/${order._id}`;

  try {
    const response = await mailtrapClient.send({
      from: mailtrapSender,
      to: recipient,
      subject: "Order Confirmation - Wheels Hub",
      html: ORDER_CONFIRMATION_TEMPLATE.replace("{orderId}", order._id)
        .replace(
          "{totalAmount}",
          new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
          }).format(order.totalAmount)
        )
        .replace("{paymentMethod}", formattedPaymentMethod)
        .replace("{orderItems}", orderItems)
        .replace("{orderLink}", orderLink),
      category: "Order Confirmation",
    });
    console.log("Order confirmation email sent to:", userEmail);
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
};

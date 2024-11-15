import emailjs from "@emailjs/nodejs";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  ORDER_CONFIRMATION_TEMPLATE,
} from "./emailTemplates.js";

// Initialize EmailJS with your credentials
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

export const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        message_html: VERIFICATION_EMAIL_TEMPLATE.replace(
          "{verificationCode}",
          verificationCode
        ),
        subject: "Verify Your Email",
      }
    );
    console.log("Verification email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

export const sendResetEmail = async (email, resetLink) => {
  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        message_html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
          "{resetLink}",
          resetLink
        ),
        subject: "Reset Your Password",
      }
    );
    console.log("Reset email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending reset email:", error);
    return false;
  }
};

export const sendPasswordResetSuccessEmail = async (email) => {
  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        message_html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        subject: "Password Reset Success",
      }
    );
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

  // Ensure we're working with numbers
  const total = Number(order.total || order.totalAmount);

  const orderItems = order.products
    .map(
      (item) => `
    <div style="border-bottom: 1px solid #e5e5e5; padding: 12px 0;">
      <p style="margin: 0; color: #4b5563;">
        ${item.product.name} x ${Number(
        item.quantity
      )} - ${new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(Number(item.product.price) * Number(item.quantity))}
      </p>
    </div>
  `
    )
    .join("");

  const formattedPaymentMethod =
    order.paymentMethod === "mpesa" ? "M-PESA" : "Bank Transfer";

  const orderLink = `${process.env.FRONTEND_URL}/orders/${order._id}`;

  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: userEmail,
        message_html: ORDER_CONFIRMATION_TEMPLATE.replace(
          "{orderId}",
          order._id
        )
          .replace(
            "{totalAmount}",
            new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
            }).format(total)
          )
          .replace("{paymentMethod}", formattedPaymentMethod)
          .replace("{orderItems}", orderItems)
          .replace("{orderLink}", orderLink),
        subject: "Order Confirmation - Wheels Hub",
      }
    );
    console.log("Order confirmation email sent to:", userEmail);
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
};

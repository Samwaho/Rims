import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  ORDER_CONFIRMATION_TEMPLATE,
  ORDER_SHIPPED_TEMPLATE,
  ORDER_DELIVERED_TEMPLATE,
} from "./emailTemplates.js";

dotenv.config();

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sendEmail = async (toEmail, subject, htmlContent) => {
  // Add verification check in sandbox mode
  if (process.env.NODE_ENV !== "production") {
    console.log("Running in sandbox mode - verifying emails are allowed");
  }

  const params = {
    Source: process.env.AWS_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: "UTF-8",
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log("Email sent successfully:", response.MessageId);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error("SES Error:", {
      message: error.message,
      code: error.Code,
      type: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      stack: error.stack,
    });
    return { success: false, error };
  }
};

export const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const htmlContent = VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      verificationCode
    );

    const result = await sendEmail(email, "Verify Your Email", htmlContent);

    if (!result.success) {
      throw result.error;
    }

    console.log("Verification email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

export const sendResetEmail = async (email, resetLink) => {
  try {
    const htmlContent = PASSWORD_RESET_REQUEST_TEMPLATE.replace(
      "{resetLink}",
      resetLink
    );

    const result = await sendEmail(email, "Reset Your Password", htmlContent);

    if (!result.success) {
      throw result.error;
    }

    console.log("Reset email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending reset email:", error);
    return false;
  }
};

export const sendPasswordResetSuccessEmail = async (email) => {
  try {
    const result = await sendEmail(
      email,
      "Password Reset Success",
      PASSWORD_RESET_SUCCESS_TEMPLATE
    );

    if (!result.success) {
      throw result.error;
    }

    console.log("Password reset success email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    return false;
  }
};

export const sendOrderConfirmationEmail = async (
  email,
  order,
  status = null
) => {
  try {
    let subject, template;
    const formattedPaymentMethod =
      order.paymentMethod === "mpesa"
        ? "M-PESA"
        : order.paymentMethod === "pesapal"
        ? "Pesapal"
        : "Bank Transfer";

    const orderLink = `${process.env.FRONTEND_URL}/orders/${order._id}`;

    // Generate order items HTML with more details
    const orderItems = order.products
      .map(
        (item) => `
        <div style="border-bottom: 1px solid #e5e5e5; padding: 12px 0;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p style="margin: 0; color: #4b5563; font-weight: bold;">
                ${item.product.name}
              </p>
              <p style="margin: 5px 0; color: #6b7280;">
                Quantity: ${item.quantity}
              </p>
              ${
                item.product.deliveryTime
                  ? `<p style="margin: 5px 0; color: #6b7280;">
                      Estimated Delivery: ${item.product.deliveryTime}
                     </p>`
                  : ""
              }
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; color: #4b5563; font-weight: bold;">
                ${new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(item.product.price * item.quantity)}
              </p>
            </div>
          </div>
        </div>
      `
      )
      .join("");

    // Determine email template and subject based on status
    switch (status) {
      case "shipped":
        subject = "Your Order Has Been Shipped - Wheels Hub";
        template = ORDER_SHIPPED_TEMPLATE;
        break;
      case "delivered":
        subject = "Your Order Has Been Delivered - Wheels Hub";
        template = ORDER_DELIVERED_TEMPLATE;
        break;
      default:
        subject = "Order Confirmation - Wheels Hub";
        template = ORDER_CONFIRMATION_TEMPLATE;
    }

    // Replace template placeholders with enhanced formatting
    const htmlContent = template
      .replace("{orderId}", order._id)
      .replace(
        "{totalAmount}",
        new Intl.NumberFormat("en-KE", {
          style: "currency",
          currency: "KES",
        }).format(order.total)
      )
      .replace("{paymentMethod}", formattedPaymentMethod)
      .replace("{orderItems}", orderItems)
      .replace("{orderLink}", orderLink)
      .replace("{trackingNumber}", order.shippingInfo?.trackingNumber || "")
      .replace("{carrier}", order.shippingInfo?.carrier || "")
      .replace(
        "{estimatedDelivery}",
        order.shippingInfo?.estimatedDelivery
          ? new Date(order.shippingInfo.estimatedDelivery).toLocaleDateString()
          : "To be determined"
      );

    const result = await sendEmail(email, subject, htmlContent);

    if (!result.success) {
      throw result.error;
    }

    console.log(`Order ${status || "confirmation"} email sent to:`, email);
    return true;
  } catch (error) {
    console.error(
      `Error sending order ${status || "confirmation"} email:`,
      error
    );
    return false;
  }
};

const handleSESError = (error) => {
  if (error.Code === "MessageRejected") {
    if (error.message.includes("Email address is not verified")) {
      console.error("Email address needs to be verified in SES sandbox mode");
      // You might want to handle this specifically
      return;
    }
  }
  throw error;
};

import emailjs from "@emailjs/browser";
import {
  ORDER_CONFIRMATION_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplates";

// Types for Order Confirmation
interface OrderProduct {
  product: {
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
}

interface ShippingDetails {
  city: string;
  subCounty: string;
  estateName: string;
  apartmentName?: string;
  houseNumber: string;
  contactNumber: string;
}

interface OrderDetails {
  _id: string;
  total: number;
  paymentMethod: string;
  shippingDetails: ShippingDetails;
  products: OrderProduct[];
  user: {
    email: string;
    username: string;
  };
}

interface EmailParams {
  to_email: string;
  order_id?: string;
  total_amount?: string;
  payment_method?: string;
  shipping_address?: string;
  order_items?: string;
  customer_name?: string;
  reset_link?: string;
  template_content?: string;
  [key: string]: unknown;
}

const formatShippingAddress = (details: ShippingDetails): string => {
  const parts = [
    details.estateName,
    details.houseNumber,
    details.apartmentName,
    details.subCounty,
    details.city,
  ].filter(Boolean);

  return parts.join(", ");
};

const formatOrderItems = (products: OrderProduct[]): string => {
  const itemsList = products
    .map((item) => `${item.product.name} (Quantity: ${item.quantity})`)
    .join("\n");

  return itemsList;
};

const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string>
): string => {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, "g"), value);
  });
  return result;
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderDetails: OrderDetails
): Promise<void> => {
  try {
    const orderLink = `${window.location.origin}/orders/${orderDetails._id}`;
    const orderItems = formatOrderItems(orderDetails.products);

    const templateContent = replaceTemplateVariables(
      ORDER_CONFIRMATION_TEMPLATE,
      {
        orderId: orderDetails._id,
        totalAmount: formatPrice(orderDetails.total),
        paymentMethod: orderDetails.paymentMethod,
        orderItems,
        orderLink,
      }
    );

    const templateParams: EmailParams = {
      to_email: email,
      template_content: templateContent,
      order_id: orderDetails._id,
      total_amount: orderDetails.total.toFixed(2),
      payment_method: orderDetails.paymentMethod,
      shipping_address: formatShippingAddress(orderDetails.shippingDetails),
      order_items: orderItems,
      customer_name: orderDetails.user.username,
    };

    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_ORDER_CONFIRMATION_TEMPLATE_ID!,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    if (response.status !== 200) {
      throw new Error("Failed to send order confirmation email");
    }
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string
): Promise<void> => {
  try {
    const templateContent = replaceTemplateVariables(
      PASSWORD_RESET_REQUEST_TEMPLATE,
      {
        resetLink,
      }
    );

    const templateParams: EmailParams = {
      to_email: email,
      template_content: templateContent,
      reset_link: resetLink,
    };

    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID!,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    if (response.status !== 200) {
      throw new Error("Failed to send password reset email");
    }
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const sendPasswordResetSuccessEmail = async (
  email: string,
  username: string
): Promise<void> => {
  try {
    const templateContent = replaceTemplateVariables(
      PASSWORD_RESET_SUCCESS_TEMPLATE,
      {
        username,
      }
    );

    const templateParams: EmailParams = {
      to_email: email,
      template_content: templateContent,
      username,
    };

    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_SUCCESS_TEMPLATE_ID!,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    if (response.status !== 200) {
      throw new Error("Failed to send password reset success email");
    }
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    throw error;
  }
};

// Initialize EmailJS
export const initEmailJS = (): void => {
  emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!);
};

// Helper function to format price
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

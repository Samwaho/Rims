// Safaricom Daraja API
import axios from "axios";

export const getAccessToken = async () => {
  try {
    const consumerKey = process.env.SAFARICOM_CONSUMER_KEY;
    const consumerSecret = process.env.SAFARICOM_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
      "base64"
    );

    const response = await axios.get(
      `${process.env.SAFARICOM_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const initiateSTKPush = async (req, res) => {
  const { phoneNumber, amount } = req.body;
  const accessToken = await getAccessToken();

  const businessShortCode = process.env.SAFARICOM_BUSINESS_SHORT_CODE;
  const passkey = process.env.SAFARICOM_PASSKEY;
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 14);
  const password = Buffer.from(
    `${businessShortCode}${passkey}${timestamp}`
  ).toString("base64");

  const response = await axios.post(
    `${process.env.SAFARICOM_URL}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: businessShortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: "https://your-callback-url.com/stk-push-callback",
      AccountReference: "AccountReference",
      TransactionDesc: "TransactionDescription",
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  res.status(200).json(response.data);
};

// New endpoint to handle direct payment notifications
export const mpesaPaymentNotification = async (req, res) => {
  const { Body } = req.body;
  const { stkCallback } = Body;

  if (stkCallback.ResultCode === 0) {
    // Payment was successful
    const { CallbackMetadata } = stkCallback;
    const amount = CallbackMetadata.Item.find(
      (item) => item.Name === "Amount"
    ).Value;
    const phoneNumber = CallbackMetadata.Item.find(
      (item) => item.Name === "PhoneNumber"
    ).Value;
    const accountNumber = CallbackMetadata.Item.find(
      (item) => item.Name === "AccountReference"
    ).Value;

    // Make changes in your backend API
    // For example, update the user's balance or order status using the account number
    // await updateUserBalance(accountNumber, amount);

    res.status(200).json({ message: "Payment processed successfully" });
  } else {
    // Payment failed
    res.status(400).json({ message: "Payment failed", details: stkCallback });
  }
};

// Register the callback URL with Safaricom
export const registerMpesaCallback = async (req, res) => {
  const accessToken = await getAccessToken();

  const response = await axios.post(
    `${process.env.SAFARICOM_URL}/mpesa/c2b/v1/registerurl`,
    {
      ShortCode: process.env.SAFARICOM_BUSINESS_SHORT_CODE,
      ResponseType: "Completed",
      ConfirmationURL:
        "https://your-domain.com/api/payment/mpesa-payment-notification",
      ValidationURL:
        "https://your-domain.com/api/payment/mpesa-payment-validation",
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  res.status(200).json(response.data);
};

// Optional: Validation endpoint if you need to validate the payment before processing
export const mpesaPaymentValidation = async (req, res) => {
  // Implement your validation logic here
  res.status(200).json({ message: "Validation successful" });
};

import axios from "axios";

const PESAPAL_API_URL = process.env.PESAPAL_API_URL;
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

export const generateToken = async () => {
  try {
    console.log("Attempting to generate Pesapal token...");

    const payload = {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    };

    const response = await axios.post(
      `${PESAPAL_API_URL}/api/Auth/RequestToken`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.data.token) {
      throw new Error("No token in response");
    }

    return response.data.token;
  } catch (error) {
    console.error("Token generation error:", error.response?.data || error);
    throw error;
  }
};

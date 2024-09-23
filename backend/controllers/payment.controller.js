import Mpesa from "mpesa-api"; // Assuming you have an Mpesa API library
import { BankAPI } from "bank-api"; // Assuming you have a Bank API library

export const processPayment = async (req, res) => {
  const { paymentMethod, totalPrice } = req.body;

  try {
    if (paymentMethod === "mpesa") {
      // Process Mpesa payment
      const mpesaResponse = await Mpesa.payment({
        amount: totalPrice,
        phoneNumber: req.user.phoneNumber,
      });
      if (mpesaResponse.success) {
        return res.json({ success: true, message: "Mpesa payment successful" });
      } else {
        throw new Error("Mpesa payment failed");
      }
    } else if (paymentMethod === "bank") {
      // Process bank payment
      const bankResponse = await BankAPI.payment({
        amount: totalPrice,
        accountNumber: req.user.bankAccount,
      });
      if (bankResponse.success) {
        return res.json({ success: true, message: "Bank payment successful" });
      } else {
        throw new Error("Bank payment failed");
      }
    } else {
      throw new Error("Invalid payment method");
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

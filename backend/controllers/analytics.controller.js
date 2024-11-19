import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const getFinancialMetrics = async (req, res) => {
  try {
    const { timeframe } = req.query;
    let dateFilter = {};
    let groupFormat;

    const now = new Date();
    switch (timeframe) {
      case "daily":
        dateFilter = {
          orderDate: { $gte: new Date(now.setDate(now.getDate() - 7)) },
        };
        groupFormat = "%Y-%m-%d";
        break;
      case "weekly":
        dateFilter = {
          orderDate: { $gte: new Date(now.setDate(now.getDate() - 28)) },
        };
        groupFormat = "%Y-%U";
        break;
      case "monthly":
        dateFilter = {
          orderDate: { $gte: new Date(now.setMonth(now.getMonth() - 6)) },
        };
        groupFormat = "%Y-%m";
        break;
      default:
        dateFilter = {};
        groupFormat = "%Y-%m-%d";
    }

    dateFilter.status = { $ne: "cancelled" };

    const [metrics, timeSeriesData] = await Promise.all([
      Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$products" },
        {
          $lookup: {
            from: "products",
            localField: "products.product",
            foreignField: "_id",
            as: "productDetail",
          },
        },
        { $unwind: "$productDetail" },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            subtotal: { $sum: "$subtotal" },
            totalTax: { $sum: "$tax" },
            totalDiscounts: { $sum: "$discount" },
            totalShipping: { $sum: "$shippingCost" },
            totalCost: {
              $sum: {
                $multiply: ["$productDetail.buyingPrice", "$products.quantity"],
              },
            },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: "$total" },
          },
        },
      ]),
      Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$products" },
        {
          $lookup: {
            from: "products",
            localField: "products.product",
            foreignField: "_id",
            as: "productDetail",
          },
        },
        { $unwind: "$productDetail" },
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: "$orderDate" } },
            revenue: { $sum: "$total" },
            subtotal: { $sum: "$subtotal" },
            orders: { $sum: 1 },
            tax: { $sum: "$tax" },
            discounts: { $sum: "$discount" },
            shipping: { $sum: "$shippingCost" },
            cost: {
              $sum: {
                $multiply: ["$productDetail.buyingPrice", "$products.quantity"],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const response = {
      ...(metrics[0] || {
        totalRevenue: 0,
        subtotal: 0,
        totalTax: 0,
        totalDiscounts: 0,
        totalShipping: 0,
        totalCost: 0,
        orderCount: 0,
        averageOrderValue: 0,
      }),
      grossProfit: metrics[0]
        ? metrics[0].totalRevenue - metrics[0].totalCost
        : 0,
      timeSeriesData: timeSeriesData.map((item) => ({
        date: item._id,
        revenue: item.revenue,
        subtotal: item.subtotal,
        orders: item.orders,
        tax: item.tax,
        discounts: item.discounts,
        shipping: item.shipping,
        cost: item.cost,
        profit: item.revenue - item.cost,
      })),
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching financial metrics:", error);
    res.status(500).json({ message: "Error fetching financial metrics" });
  }
};

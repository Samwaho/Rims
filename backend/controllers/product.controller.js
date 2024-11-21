import Product from "../models/product.model.js";
import TaxConfig from "../models/tax.model.js";
import Discount from "../models/discount.model.js";

// Helper functions
const calculateAverageRating = (reviews) => {
  if (!reviews?.length) return 0;
  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Number((total / reviews.length).toFixed(1));
};

const formatReview = (review) => ({
  ...review,
  createdAt: review.createdAt
    ? new Date(review.createdAt).toISOString()
    : new Date().toISOString(),
});

const calculatePriceDetails = async (basePrice) => {
  try {
    // Get active tax configuration
    const activeTax = await TaxConfig.findOne({ isActive: true });
    const taxRate = activeTax ? activeTax.rate : 0;
    const taxAmount = (basePrice * taxRate) / 100;

    return {
      basePrice,
      taxRate,
      taxAmount,
      totalPrice: basePrice + taxAmount,
    };
  } catch (error) {
    console.error("Error calculating price details:", error);
    return {
      basePrice,
      taxRate: 0,
      taxAmount: 0,
      totalPrice: basePrice,
    };
  }
};

const formatProductResponse = async (product) => {
  const averageRating = calculateAverageRating(product.reviews);
  const priceDetails = await calculatePriceDetails(product.price);

  return {
    ...product,
    buyingPrice: Number(product.buyingPrice),
    averageRating,
    reviewCount: product.reviews?.length || 0,
    reviews: product.reviews?.map(formatReview) || [],
    priceDetails,
  };
};

const validateProductData = (productData) => {
  const requiredFields = [
    "name",
    "description",
    "price",
    "buyingPrice",
    "stock",
    "category",
    "size",
    "madeIn",
    "shippingCost",
    "deliveryTime",
    "productType",
  ];
  const missingFields = requiredFields.filter(
    (field) => !productData[field] && productData[field] !== 0
  );
  return missingFields;
};

// Controllers
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Add search query condition
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      Product.find(searchQuery).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(searchQuery),
    ]);

    const productsWithStats = await Promise.all(
      products.map((product) => formatProductResponse(product.toObject()))
    );

    res.status(200).json({
      products: productsWithStats,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const formattedProduct = await formatProductResponse(product);
    res.status(200).json(formattedProduct);
  } catch (error) {
    console.error("Error in getProductById:", error);
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { productData, imageUrls } = req.body;

    if (!productData) {
      return res.status(400).json({
        message: "Product data is required",
        receivedData: req.body,
      });
    }

    const sanitizedProductData = {
      ...productData,
      price: parseFloat(productData.price) || 0,
      buyingPrice: parseFloat(productData.buyingPrice) || 0,
      shippingCost: parseFloat(productData.shippingCost) || 0,
      stock: parseInt(productData.stock) || 0,
    };

    const missingFields = validateProductData(sanitizedProductData);
    if (missingFields.length) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        receivedData: sanitizedProductData,
      });
    }

    const product = new Product({
      ...sanitizedProductData,
      images: imageUrls || [],
      specifications: sanitizedProductData.specifications || [],
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newProduct = await product.save();
    res.status(201).json({
      message: "Product created successfully",
      product: await formatProductResponse(newProduct.toObject()),
    });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A product with this name already exists",
      });
    }
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { productData, imageUrls } = req.body;
    const productId = req.params.id;

    console.log("Received product data:", productData);

    if (!productData) {
      return res.status(400).json({
        message: "Product data is required",
        receivedData: req.body,
      });
    }

    // Validate numeric values with default to 0 if invalid
    const buyingPrice = Number(productData.buyingPrice) || 0;
    const price = Number(productData.price) || 0;
    const stock = Number(productData.stock) || 0;
    const shippingCost = Number(productData.shippingCost) || 0;

    // Validate all numeric values
    if (
      isNaN(buyingPrice) ||
      isNaN(price) ||
      isNaN(stock) ||
      isNaN(shippingCost)
    ) {
      return res.status(400).json({
        message: "Invalid numeric values provided",
        receivedData: { buyingPrice, price, stock, shippingCost },
      });
    }

    const sanitizedProductData = {
      ...productData,
      price,
      buyingPrice,
      stock,
      shippingCost,
      deliveryTime: productData.deliveryTime || "2-3 business days", // Add default value
    };

    console.log("Sanitized product data:", sanitizedProductData);

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const validSpecifications = Array.isArray(productData.specifications)
      ? productData.specifications.filter(
          (spec) => spec && typeof spec === "object" && spec.name && spec.value
        )
      : [];

    const updateData = {
      ...sanitizedProductData,
      images: imageUrls || existingProduct.images,
      specifications: validSpecifications,
      updatedAt: new Date(),
    };

    // Additional validation to ensure no NaN values
    Object.keys(updateData).forEach((key) => {
      if (typeof updateData[key] === "number" && isNaN(updateData[key])) {
        updateData[key] = 0; // Set default value for any NaN numeric fields
      }
    });

    console.log("Final update data:", updateData);

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const formattedResponse = await formatProductResponse(updatedProduct);
    console.log("Formatted response:", formattedResponse);

    res.status(200).json({
      message: "Product updated successfully",
      product: formattedResponse,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { rating, comment, userId, userName } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.reviews.some((review) => review.user.toString() === userId)) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    const review = {
      user: userId,
      rating: Number(rating),
      comment,
      userName,
      createdAt: new Date(),
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json({
      message: "Review added successfully",
      product: formatProductResponse(product.toObject()),
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment, userId } = req.body;
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this review" });
    }

    review.rating = Number(rating);
    review.comment = comment;
    await product.save();

    res.status(200).json({
      message: "Review updated successfully",
      product: formatProductResponse(product.toObject()),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    const { userId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    review.remove();
    await product.save();

    res.status(200).json({
      message: "Review deleted successfully",
      product: formatProductResponse(product.toObject()),
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .select("reviews")
      .populate("reviews.user", "name")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const formattedProduct = formatProductResponse(product);
    res.status(200).json({
      reviews: formattedProduct.reviews,
      numReviews: formattedProduct.reviewCount,
      averageRating: formattedProduct.averageRating,
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    const {
      query = "",
      category = "",
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
    } = req.query;

    let searchQuery = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    };

    if (category) {
      searchQuery.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      searchQuery.price = {};
      if (minPrice !== undefined) searchQuery.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) searchQuery.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: order === "desc" ? -1 : 1 };

    const [products, total] = await Promise.all([
      Product.find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(searchQuery),
    ]);

    const formattedProducts = await Promise.all(
      products.map(formatProductResponse)
    );

    res.status(200).json({
      products: formattedProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    next(error);
  }
};

export const calculateFinalPrice = async (req, res, next) => {
  try {
    const { productId, discountCode, quantity = 1 } = req.body;

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const priceDetails = await calculatePriceDetails(product.price);
    let finalPrice = priceDetails.totalPrice;
    let discountAmount = 0;
    let appliedDiscount = null;

    if (discountCode) {
      const discount = await Discount.findOne({
        code: discountCode,
        isActive: true,
        $or: [
          { expiryDate: { $gt: new Date() } },
          { expiryDate: { $exists: false } },
        ],
      });

      if (discount) {
        if (
          (!discount.maxUses || discount.usedCount < discount.maxUses) &&
          (!discount.minPurchase ||
            priceDetails.totalPrice * quantity >= discount.minPurchase)
        ) {
          discountAmount =
            discount.type === "percentage"
              ? (priceDetails.totalPrice * discount.value) / 100
              : discount.value;
          finalPrice = Math.max(0, priceDetails.totalPrice - discountAmount);
          appliedDiscount = {
            code: discount.code,
            type: discount.type,
            value: discount.value,
            discountAmount,
          };
        }
      }
    }

    res.status(200).json({
      productId,
      quantity,
      priceDetails,
      appliedDiscount,
      finalPrice,
      totalAmount: finalPrice * quantity,
    });
  } catch (error) {
    console.error("Error calculating final price:", error);
    next(error);
  }
};

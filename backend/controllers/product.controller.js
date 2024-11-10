import Product from "../models/product.model.js";

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

const formatProductResponse = (product) => {
  const averageRating = calculateAverageRating(product.reviews);
  return {
    ...product,
    averageRating,
    reviewCount: product.reviews?.length || 0,
    reviews: product.reviews?.map(formatReview) || [],
  };
};

const validateProductData = (productData) => {
  const requiredFields = [
    "name",
    "description",
    "price",
    "stock",
    "category",
    "brand",
    "madeIn",
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
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    const productsWithStats = products.map((product) =>
      formatProductResponse(product.toObject())
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

    res.status(200).json(formatProductResponse(product));
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

    const missingFields = validateProductData(productData);
    if (missingFields.length) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        receivedData: productData,
      });
    }

    const product = new Product({
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock),
      images: imageUrls || [],
      specifications: productData.specifications || [],
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newProduct = await product.save();
    res.status(201).json({
      message: "Product created successfully",
      product: formatProductResponse(newProduct.toObject()),
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

    if (!productData) {
      return res.status(400).json({
        message: "Product data is required",
        receivedData: req.body,
      });
    }

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
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock),
      images: imageUrls || existingProduct.images,
      specifications: validSpecifications,
      updatedAt: new Date(),
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: formatProductResponse(updatedProduct),
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
    } = req.query;

    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
      ...(category && { category }),
    };

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

    res.status(200).json({
      products: products.map(formatProductResponse),
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    next(error);
  }
};

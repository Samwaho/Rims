import Product from "../models/product.model.js";

export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate average rating and format response for each product
    const productsWithStats = products.map((product) => {
      const averageRating = product.reviews.length
        ? Number(
            (
              product.reviews.reduce((acc, review) => acc + review.rating, 0) /
              product.reviews.length
            ).toFixed(1)
          )
        : 0;

      return {
        ...product.toObject(),
        averageRating,
        reviewCount: product.reviews.length,
        reviews: product.reviews.map((review) => ({
          ...review,
          createdAt: review.createdAt.toISOString(),
        })),
      };
    });

    const total = await Product.countDocuments();

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

    // Calculate average rating
    const averageRating = product.reviews?.length
      ? Number(
          (
            product.reviews.reduce((acc, review) => acc + review.rating, 0) /
            product.reviews.length
          ).toFixed(1)
        )
      : 0;

    // Format the response to match frontend expectations
    const productWithStats = {
      ...product,
      averageRating,
      reviewCount: product.reviews?.length || 0,
      reviews:
        product.reviews?.map((review) => ({
          ...review,
          createdAt: review.createdAt
            ? new Date(review.createdAt).toISOString()
            : new Date().toISOString(),
        })) || [],
    };

    res.status(200).json(productWithStats);
  } catch (error) {
    console.error("Error in getProductById:", error);
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { productData, imageUrls } = req.body;

    // Validate that productData exists
    if (!productData) {
      return res.status(400).json({
        message: "Product data is required",
        receivedData: req.body,
      });
    }

    // Validate required fields
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

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        receivedData: productData,
      });
    }

    // Create new product with validated data
    const product = new Product({
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock),
      images: imageUrls || [], // Add image URLs from UploadThing
      specifications: productData.specifications || [],
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save the product
    const newProduct = await product.save();

    // Return formatted product response
    const formattedProduct = {
      ...newProduct.toObject(),
      averageRating: 0,
      reviewCount: 0,
      reviews: [],
    };

    res.status(201).json({
      message: "Product created successfully",
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    // Improved error handling
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.code === 11000) {
      // Duplicate key error
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

    // Validate the product exists
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure all required fields are present
    const requiredFields = [
      "name",
      "description",
      "price",
      "stock",
      "category",
      "brand",
      "madeIn",
    ];

    const missingFields = requiredFields.filter((field) => !productData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Format the data for update
    const updateData = {
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock),
      images: imageUrls,
      specifications:
        productData.specifications?.filter(
          (spec) => spec.name.trim() && spec.value.trim()
        ) || [],
      updatedAt: new Date(),
    };

    // Update the product with new data
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    // Calculate stats for response
    const averageRating = updatedProduct.reviews?.length
      ? Number(
          (
            updatedProduct.reviews.reduce(
              (acc, review) => acc + review.rating,
              0
            ) / updatedProduct.reviews.length
          ).toFixed(1)
        )
      : 0;

    const productWithStats = {
      ...updatedProduct,
      averageRating,
      reviewCount: updatedProduct.reviews?.length || 0,
    };

    res.status(200).json({
      message: "Product updated successfully",
      product: productWithStats,
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

    // Check if user has already reviewed
    const hasReviewed = product.reviews.find(
      (review) => review.user.toString() === userId
    );

    if (hasReviewed) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    // Add the review with createdAt timestamp
    const review = {
      user: userId,
      rating: Number(rating),
      comment,
      userName,
      createdAt: new Date(), // Add creation timestamp
    };

    product.reviews.push(review);

    // Calculate new average rating
    const averageRating =
      product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length;

    await product.save();

    // Return formatted response matching frontend expectations
    const productWithStats = {
      ...product.toObject(),
      averageRating: Number(averageRating.toFixed(1)), // Format to match frontend display
      reviewCount: product.reviews.length,
      reviews: product.reviews.map((review) => ({
        ...review.toObject(),
        createdAt: review.createdAt.toISOString(), // Ensure ISO string format for dates
      })),
    };

    res.status(201).json({
      message: "Review added successfully",
      product: productWithStats,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const { productId, reviewId } = req.params;
    const userId = req.body.userId;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the user owns the review
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this review" });
    }

    // Update the review
    review.rating = Number(rating);
    review.comment = comment;

    // Recalculate average rating
    product.calculateAverageRating();

    await product.save();

    res.status(200).json({ message: "Review updated successfully", product });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    const userId = req.body.userId;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the user owns the review
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    // Remove the review
    review.remove();

    // Recalculate average rating
    product.calculateAverageRating();

    await product.save();

    res.status(200).json({ message: "Review deleted successfully", product });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .select("reviews numReviews averageRating")
      .populate("reviews.user", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      reviews: product.reviews,
      numReviews: product.numReviews,
      averageRating: product.averageRating,
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
    };

    if (category) {
      searchQuery.category = category;
    }

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: order === "desc" ? -1 : 1 };

    const products = await Product.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(searchQuery);

    res.status(200).json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    next(error);
  }
};

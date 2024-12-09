const cloudinary = require("cloudinary").v2;
const { categoryModel } = require("../models/categoryModel");
const { productModel } = require("../models/productModel");
const { userModel } = require("../models/userModel");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productModel
      .find()
      .sort({ createdAt: -1 })
      .populate("categoryId")
      .populate("userId");
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel
      .findById(id)
      .populate("categoryId")
      .populate("userId");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  console.log("getProductsByCategory");
  try {
    const { categoryId } = req.params;
    console.log("categoryId", categoryId);
    const products = await productModel
      .find({ categoryId })
      .sort({ createdAt: -1 })
      .populate("categoryId")
      .populate("userId");;

    if (products.length < 0) {
      products = [];
      return res
        .status(404)
        .json({ message: "No products found for this category", products });
    }

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Search products (with optional category filter)
exports.searchProducts = async (req, res) => {
  try {
    const { query, categoryId } = req.query;
    const filters = {};

    if (query) {
      filters.title = { $regex: query, $options: "i" }; // Case-insensitive search
    }

    if (categoryId) {
      filters.categoryId = categoryId;
    }

    const products = await productModel.find(filters);

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all products by a user
exports.getProductsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const products = await productModel.find({ userId });

    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found for this user" });
    }

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle image updates (if new images are provided)
    if (req.files && req.files.length > 0) {
      const images = [];
      for (const file of req.files) {
        const imageBuffer = file.buffer.toString("base64");
        const result = await cloudinary.uploader.upload(
          `data:${file?.mimetype};base64,${imageBuffer}`,
          { folder: "products" }
        );

        const thumbnailUrl = cloudinary.url(result.public_id, {
          width: 150,
          height: 150,
          crop: "thumb",
          gravity: "center",
          quality: "auto",
          fetch_format: "auto",
        });

        images.push({
          url: result.secure_url,
          publicId: result.public_id,
          thumbnailUrl,
        });
      }
      updates.images = images;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete associated images from Cloudinary
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await productModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const userId = req.payload.aud;
    const { title, price, categoryId, description, latitude, longitude } =
      req.body;
    console.log("body ", latitude, longitude);
    // console.log("files", req.files);
    // Validate user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate category
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Validate required fields
    if (!title || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Upload images to Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Convert image buffer to Base64 string
        const imageBuffer = file.buffer.toString("base64");
        // Upload the image to Cloudinary as Base64 string
        const result = await cloudinary.uploader.upload(
          `data:${file?.mimetype};base64,${imageBuffer}`,
          {
            folder: "products",
          }
        );

        // Generate thumbnail URL with Cloudinary transformation
        const thumbnailUrl = cloudinary.url(result.public_id, {
          width: 150,
          height: 150,
          crop: "thumb",
          gravity: "center",
          quality: "auto",
          fetch_format: "auto",
        });

        images.push({
          url: result.secure_url,
          publicId: result.public_id,
          thumbnailUrl, // Include the generated thumbnail URL
        });
      }
    }

    // Create product
    const product = new productModel({
      title,
      price,
      description,
      images,
      categoryId,
      userId,
      location: {
        latitude,
        longitude,
      },
    });

    await product.save();

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
    next(error);
  }
};

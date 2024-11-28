const express = require("express");
const productRouter = express.Router();

const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getProductsByUser,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");

const { verifyAccessToken } = require("../helpers/getJwt");
const multer = require("multer");
const upload = multer(); // Initialize multer for handling file uploads

// Routes
productRouter.get("/products", getAllProducts); // Get all products
productRouter.get("/products/:id", getProductById); // Get product by ID
productRouter.get("/products/category/:categoryId", getProductsByCategory); // Get products by category
productRouter.get("/products/search", searchProducts); // Search products (with optional category filter)
productRouter.get("/products/user/:userId", getProductsByUser); // Get all products by a user

productRouter.post(
  "/products",
  verifyAccessToken,
  upload.array("images"), // Handle file uploads for product creation
  createProduct
); // Create a product

productRouter.put(
  "/products/:id",
  verifyAccessToken,
  upload.array("images"), // Handle file uploads for product updates
  updateProduct
); // Update a product

productRouter.delete("/products/:id", verifyAccessToken, deleteProduct); // Delete a product

module.exports = { productRouter };

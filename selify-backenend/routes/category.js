const express = require("express");
const categoryRouter = express.Router();

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category");
const { verifyAccessToken } = require("../helpers/getJwt");

categoryRouter.post("/category", verifyAccessToken, createCategory);
categoryRouter.get("/category", getAllCategories);
categoryRouter.get("/category/:id", getCategoryById);
categoryRouter.put("/category/:id", verifyAccessToken, updateCategory);
categoryRouter.delete("/category/:id", verifyAccessToken, deleteCategory);

module.exports = { categoryRouter };

const express = require("express");
const categoryRouter = express.Router();

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category");

categoryRouter.post("/category", createCategory);
categoryRouter.get("/category", getAllCategories);
categoryRouter.get("/category/:id", getCategoryById);
categoryRouter.put("/category/:id", updateCategory);
categoryRouter.delete("/category/:id", deleteCategory);

module.exports = { categoryRouter };

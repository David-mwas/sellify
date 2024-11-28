const { categoryModel } = require("../models/categoryModel");

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await categoryModel.create({ name });

    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfuly", category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfuly" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

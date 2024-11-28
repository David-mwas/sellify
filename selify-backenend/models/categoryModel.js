const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

exports.categoryModel = mongoose.model("Category", categorySchema);

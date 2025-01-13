const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  emoji: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

exports.categoryModel = mongoose.model("Category", categorySchema);

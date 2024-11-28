const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a name"],
  },
  price: {
    type: Number,
    required: [true, "Please provide a price"],
  },

  images: [
    {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
      thumbnailUrl: {
        type: String,
      },
    },
  ],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  location: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
});

exports.productModel = mongoose.model("Product", productSchema);

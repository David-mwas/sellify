const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  imageUrl: {
    url: {
      type: String,
    },
    publicId: {
      type: String,
    },
  },
  phoneNumber: {
    type: String,
  },
  location: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  listings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  expoPushToken: {
    type: String,
  },
});

userSchema.pre("save", async function () {
  if (this.isModified("password") || this.isNew) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
  }
});

exports.userModel = mongoose.model("User", userSchema);

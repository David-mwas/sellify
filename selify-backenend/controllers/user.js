const { userModel } = require("../models/userModel");
const { hashPassword } = require("../utils/hashPassword");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.userProfile = async (req, res, next) => {
  const user = await userModel.findById(req.payload.aud);

  return res.status(200).json({ userProfile: user });
};

exports.editProfile = async (req, res, next) => {
  console.log("Edit profile");
  try {
    const image = { url: "", publicId: "" };
    const data = req.body;
    console.log("Edit profile", req.files);
    if (req.files) {
      // Single file upload
      const imageBuffer = req.files[0].buffer.toString("base64");
      const result = await cloudinary.uploader.upload(
        `data:${req.files[0].mimetype};base64,${imageBuffer}`,
        { folder: "selifyuser" }
      );

      image.url = result.secure_url;
      image.publicId = result.public_id;
    }

    const user = await userModel.findById(req.payload.aud);
    if (user) {
      user.set({
        ...data,
        imageUrl: image.url ? image : user.imageUrl, // Preserve existing image
      });
      await user.save();
    }

    return res.status(200).json({
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// Save user's Expo push token
exports.savePushToken = async (req, res) => {
  try {
    const { userId, expoPushToken } = req.body;

    if (!userId || !expoPushToken) {
      return res
        .status(400)
        .json({ message: "User ID and push token are required" });
    }

    await userModel.findByIdAndUpdate(userId, { expoPushToken });

    res.status(200).json({ message: "Push token saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

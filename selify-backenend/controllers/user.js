const { userModel } = require("../models/userModel");
const { hashPassword } = require("../utils/hashPassword");

exports.userProfile = async (req, res, next) => {
  const user = await userModel.findById(req.payload.aud);

  return res.status(200).json({ userProfile: user });
};

exports.editProfile = async (req, res, next) => {
  const data = req.body;
  if ("password" in data) {
    data.password = await hashPassword(data.password);
  }
  const user = await userModel.findByIdAndUpdate(
    req.payload.aud,
    { $set: data },
    { new: true }
  );
  return res.status(200).json({
    username: user.username,
    email: user.email,
  });
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

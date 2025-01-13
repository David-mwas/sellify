const userRouter = require("express").Router();

const {
  userProfile,
  editProfile,
  getUserById,
} = require("../controllers/user");

const { verifyAccessToken } = require("../helpers/getJwt");

userRouter.get("/user/profile", verifyAccessToken, userProfile);
userRouter.put("/user/editprofile", verifyAccessToken, editProfile);

userRouter.get("/user/:id", getUserById);

module.exports = { userRouter };

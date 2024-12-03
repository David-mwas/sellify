const userRouter = require("express").Router();

const { userProfile, editProfile } = require("../controllers/user");

const { verifyAccessToken } = require("../helpers/getJwt");

userRouter.get("/user/profile", verifyAccessToken, userProfile);
userRouter.put("/user/edit-profile", verifyAccessToken, editProfile);

module.exports = { userRouter };

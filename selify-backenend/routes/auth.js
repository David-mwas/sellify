authRouter = require("express").Router();
const {
  Register,
  login,
  forgotPassword,
  VerifyResetToken,
  resetPassword,
} = require("../controllers/auth");
const { verifyAccessToken } = require("../helpers/getJwt");

authRouter.post("/auth/register", Register);
authRouter.post("/auth/login", login);
authRouter.post("/auth/forget-password", verifyAccessToken, forgotPassword);
authRouter.get("/auth/reset-password", VerifyResetToken);
authRouter.post("/auth/reset-password", verifyAccessToken, resetPassword);

module.exports = { authRouter };

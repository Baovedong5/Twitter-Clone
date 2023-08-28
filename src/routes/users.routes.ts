import express from "express";
import {
  emailVerifyController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  verifyForgotPasswordController,
} from "~/controllers/users.controllers";
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
} from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";
import { validate } from "~/utils/validation";

const userRouter = express.Router();

userRouter.post(
  "/login",
  validate(loginValidator),
  wrapRequestHandler(loginController)
);
userRouter.post(
  "/register",
  validate(registerValidator),
  wrapRequestHandler(registerController)
);

userRouter.post(
  "/logout",
  validate(accessTokenValidator),
  validate(refreshTokenValidator),
  wrapRequestHandler(logoutController)
);

userRouter.post(
  "/verify-email",
  validate(emailVerifyTokenValidator),
  wrapRequestHandler(emailVerifyController)
);

userRouter.post(
  "/resend-verify-email",
  accessTokenValidator,
  wrapRequestHandler(resendVerifyEmailController)
);

userRouter.post(
  "/forgot-password",
  validate(forgotPasswordValidator),
  wrapRequestHandler(forgotPasswordController)
);

userRouter.post(
  "/verify-forgot-password",
  validate(verifyForgotPasswordTokenValidator),
  wrapRequestHandler(verifyForgotPasswordController)
);

userRouter.post(
  "/reset-password",
  validate(resetPasswordValidator),
  wrapRequestHandler(resetPasswordController)
);

export default userRouter;

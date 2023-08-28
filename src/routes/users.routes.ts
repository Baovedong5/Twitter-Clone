import express from "express";
import {
  emailVerifyController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
} from "~/controllers/users.controllers";
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
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

export default userRouter;

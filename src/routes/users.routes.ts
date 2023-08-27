import express from "express";
import {
  loginController,
  logoutController,
  registerController,
} from "~/controllers/users.controllers";
import {
  accessTokenValidator,
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

export default userRouter;

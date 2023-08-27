import express from "express";
import {
  loginController,
  registerController,
} from "~/controllers/users.controllers";
import {
  loginValidator,
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

export default userRouter;

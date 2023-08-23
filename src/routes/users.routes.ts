import express from "express";
import { loginController } from "~/controllers/users.controllers";
import { loginValidator } from "~/middlewares/users.middlewares";
const userRouter = express.Router();

userRouter.post("/login", loginValidator, loginController);

export default userRouter;

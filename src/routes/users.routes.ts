import express from "express";
import {
  changePasswordController,
  emailVerifyController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unFollowController,
  updateMecontroller,
  verifyForgotPasswordController,
} from "~/controllers/users.controllers";
import { filterMiddleware } from "~/middlewares/common.middlewares";
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator,
} from "~/middlewares/users.middlewares";
import { UpdateMeReqBody } from "~/models/requests/User.requests";
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
  "/refresh-token",
  validate(refreshTokenValidator),
  wrapRequestHandler(refreshTokenController)
);

userRouter.post(
  "/verify-email",
  validate(emailVerifyTokenValidator),
  wrapRequestHandler(emailVerifyController)
);

userRouter.post(
  "/resend-verify-email",
  validate(accessTokenValidator),
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

userRouter.get(
  "/me",
  validate(accessTokenValidator),
  wrapRequestHandler(getMeController)
);

userRouter.patch(
  "/me",
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(updateMeValidator),
  filterMiddleware<UpdateMeReqBody>([
    "name",
    "date_of_birth",
    "bio",
    "location",
    "website",
    "username",
    "avatar",
    "cover_photo",
  ]),
  wrapRequestHandler(updateMecontroller)
);

userRouter.post(
  "/follow",
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(followValidator),
  wrapRequestHandler(followController)
);

userRouter.delete(
  "/follow/:user_id",
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(unfollowValidator),
  wrapRequestHandler(unFollowController)
);

userRouter.put(
  "/change-password",
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(changePasswordValidator),
  wrapRequestHandler(changePasswordController)
);

userRouter.get("/:username", wrapRequestHandler(getProfileController));

export default userRouter;

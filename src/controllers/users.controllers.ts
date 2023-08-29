import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ObjectId } from "mongodb";
import { UserVerifyStatus } from "~/constants/enum";
import httpStatus from "~/constants/httpStatus";
import { usersMessage } from "~/constants/messages";
import databaseService from "~/database/database";

import {
  ChangePasswordReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnFollowReqParams,
  UpdateMeReqBody,
  VefiryForgotPasswordReqBody,
  VerifyEmailReqBody,
} from "~/models/requests/User.requests";
import User from "~/models/schemas/User.schemas";
import usersService from "~/services/users.services";

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response
) => {
  const user = req.user as User;
  const user_id = user._id as ObjectId;
  const result = await usersService.login({
    user_id: user_id.toString(),
    verify: user.verify,
  });
  return res.status(200).json({
    message: usersMessage.LOGIN_SUCCESS,
    data: result,
  });
};

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body);
  return res.status(200).json({
    message: usersMessage.REGISTER_SUCCESS,
    data: result,
  });
};

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body;

  const result = await usersService.logout(refresh_token);
  return res.json(result);
};

export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload;
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id),
  });
  //Neu khong tim thay user
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: usersMessage.USER_NOT_FOUND,
    });
  }
  //Da verify roi thi se khong bao loi
  //Minh se tra ve status OK vs message la da verify truoc do r
  if (user.email_verify_token === "") {
    return res.json({
      message: usersMessage.EMAIL_ALREADY_VERIFIED,
    });
  }
  //Neu chua verify
  const result = await usersService.verifyEmail(user_id);
  return res.json({
    message: usersMessage.EMAIL_VERIFY_SUCCESS,
    result,
  });
};

export const resendVerifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id),
  });
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: usersMessage.USER_NOT_FOUND,
    });
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: usersMessage.EMAIL_ALREADY_VERIFIED,
    });
  }
  const result = await usersService.resendVerifyEmail(user_id);
  return res.json(result);
};

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify } = req.user as User;
  const result = await usersService.forgotPassword({
    user_id: (_id as ObjectId).toString(),
    verify,
  });
  return res.json(result);
};

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VefiryForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json({
    message: usersMessage.VERIFY_FORGOT_PASSWORD_SUCCESS,
  });
};

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload;
  const { password } = req.body;
  const result = await usersService.resetPassword(user_id, password);
  return res.json(result);
};

export const getMeController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await usersService.getMe(user_id);
  return res.json({
    message: usersMessage.GET_ME_SUCCESS,
    data: result,
  });
};

export const updateMecontroller = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { body } = req;

  const user = await usersService.updateMe(user_id, body);

  return res.json({
    message: usersMessage.UPDATE_ME_SUCCESS,
    data: user,
  });
};

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { followed_user_id } = req.body;

  const result = await usersService.follow(user_id, followed_user_id);

  return res.json(result);
};

export const unFollowController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;

  const { user_id: followed_user_id } = req.params;

  const result = await usersService.unfollow(user_id, followed_user_id);

  return res.json(result);
};

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { password } = req.body;
  const result = await usersService.changePassword(user_id, password);
  return res.json(result);
};

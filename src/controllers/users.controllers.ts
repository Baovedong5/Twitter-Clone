import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ObjectId } from "mongodb";
import { UserVerifyStatus } from "~/constants/enum";
import httpStatus from "~/constants/httpStatus";
import { usersMessage } from "~/constants/messages";
import databaseService from "~/database/database";

import {
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload,
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
  const result = await usersService.login(user_id.toString());
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

import { Request } from "express";
import { JsonWebTokenError } from "jsonwebtoken";

import httpStatus from "~/constants/httpStatus";
import { usersMessage } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/Errors";
import { verifyToken } from "./jwt";
import { capitalize } from "lodash";

export const numberEnumToArray = (numberEnum: {
  [key: string]: string | number;
}) => {
  return Object.values(numberEnum).filter(
    (value) => typeof value === "number"
  ) as number[];
};

export const verifyAccessToken = async (
  access_token: string,
  req?: Request
) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: usersMessage.ACCESS_TOKEN_IS_REQUIRED,
      status: httpStatus.UNAUTHOZIZED,
    });
  }

  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
    });
    if (req) {
      (req as Request).decoded_authorization = decoded_authorization;
      return true;
    }
    return decoded_authorization;
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: httpStatus.UNAUTHOZIZED,
    });
  }
};

import { Request } from "express";
import { checkSchema } from "express-validator";
import { JsonWebTokenError } from "jsonwebtoken";
import httpStatus from "~/constants/httpStatus";
import { usersMessage } from "~/constants/messages";
import databaseService from "~/database/database";
import { ErrorWithStatus } from "~/models/Errors";
import usersService from "~/services/users.services";
import { verifyToken } from "~/utils/jwt";

export const loginValidator = checkSchema(
  {
    email: {
      isEmail: {
        errorMessage: usersMessage.EMAIL_IS_INVALID,
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({
            email: value,
          });

          if (user === null) {
            throw new Error(usersMessage.EMAIL_OR_PASSWORD_IS_INCORRECT);
          }
          req.user = user;

          return true;
        },
      },
    },

    password: {
      notEmpty: {
        errorMessage: usersMessage.PASSOWRD_IS_REQUIRED,
      },
      isString: {
        errorMessage: usersMessage.PASSOWRD_MUST_BE_A_STRING,
      },
      isLength: {
        options: {
          min: 6,
          max: 50,
        },
        errorMessage: usersMessage.PASSOWRD_LENGTH_MUST_BE_FROM_6_TO_50,
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1,
        },
        errorMessage: usersMessage.PASSOWRD_MUST_BE_STRONG,
      },
    },
  },
  ["body"]
);

export const registerValidator = checkSchema(
  {
    name: {
      notEmpty: {
        errorMessage: usersMessage.NAME_IS_REQUIRED,
      },
      isString: {
        errorMessage: usersMessage.NAME_MUST_BE_A_STRING,
      },
      isLength: {
        options: {
          min: 1,
          max: 100,
        },
        errorMessage: usersMessage.NAME_LENGTH_MUST_BE_FROM_1_TO_100,
      },
      trim: true,
    },

    email: {
      isEmail: {
        errorMessage: usersMessage.EMAIL_IS_INVALID,
      },
      notEmpty: {
        errorMessage: usersMessage.EMAIL_IS_REQUIRED,
      },
      trim: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await usersService.checkEmailExist(value);
          if (isExistEmail) {
            throw new Error(usersMessage.EMAIL_ALREADY_EXISTS);
          }
          return true;
        },
      },
    },

    password: {
      notEmpty: {
        errorMessage: usersMessage.PASSOWRD_IS_REQUIRED,
      },
      isString: {
        errorMessage: usersMessage.PASSOWRD_MUST_BE_A_STRING,
      },
      isLength: {
        options: {
          min: 6,
          max: 50,
        },
        errorMessage: usersMessage.PASSOWRD_LENGTH_MUST_BE_FROM_6_TO_50,
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1,
        },
        errorMessage: usersMessage.PASSOWRD_MUST_BE_STRONG,
      },
    },

    confirm_password: {
      notEmpty: {
        errorMessage: usersMessage.CONFIRM_PASSOWRD_IS_REQUIRED,
      },
      isString: {
        errorMessage: usersMessage.CONFIRM_PASSOWRD_MUST_BE_A_STRING,
      },
      isLength: {
        options: {
          min: 6,
          max: 50,
        },
        errorMessage: usersMessage.CONFIRM_PASSOWRD_LENGTH_MUST_BE_FROM_6_TO_50,
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1,
        },
        errorMessage: usersMessage.CONFIRM_PASSOWRD_MUST_BE_STRONG,
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(
              usersMessage.CONFIRM_PASSOWRD_MUST_BE_THE_SAME_PASSWORD
            );
          }
          return true;
        },
      },
    },

    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true,
        },
        errorMessage: usersMessage.DATE_OF_BIRTH_MUST_BE_ISO8601,
      },
    },
  },
  ["body"]
);

export const accessTokenValidator = checkSchema(
  {
    authorization: {
      notEmpty: {
        errorMessage: usersMessage.ACCESS_TOKEN_IS_REQUIRED,
      },
      custom: {
        options: async (value: string, { req }) => {
          const access_token = value.split(" ")[1];
          if (!access_token) {
            throw new ErrorWithStatus({
              message: usersMessage.ACCESS_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHOZIZED,
            });
          }

          try {
            const decoded_authorization = await verifyToken({
              token: access_token,
            });
            (req as Request).decoded_authorization = decoded_authorization;
          } catch (error) {
            throw new ErrorWithStatus({
              message: (error as JsonWebTokenError).message,
              status: httpStatus.UNAUTHOZIZED,
            });
          }

          return true;
        },
      },
    },
  },
  ["headers"]
);

export const refreshTokenValidator = checkSchema(
  {
    refresh_token: {
      notEmpty: {
        errorMessage: usersMessage.REFRESH_TOKEN_IS_REQUIRED,
      },
      custom: {
        options: async (value: string, { req }) => {
          try {
            const [decoded_refresh_token, refresh_token] = await Promise.all([
              verifyToken({ token: value }),
              databaseService.refreshTokens.findOne({
                token: value,
              }),
            ]);
            if (refresh_token === null) {
              throw new ErrorWithStatus({
                message: usersMessage.USE_REFRESH_TOKEN_OR_NOT_EXIST,
                status: httpStatus.UNAUTHOZIZED,
              });
            }
            (req as Request).decoded_refresh_token = decoded_refresh_token;
          } catch (error) {
            if (error) {
              throw new ErrorWithStatus({
                message: (error as JsonWebTokenError).message,
                status: httpStatus.UNAUTHOZIZED,
              });
            }
            throw error;
          }

          return true;
        },
      },
    },
  },
  ["body"]
);

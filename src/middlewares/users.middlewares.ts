import { error } from "console";
import { NextFunction, Request, Response } from "express";
import { ParamSchema, checkSchema } from "express-validator";
import { JsonWebTokenError } from "jsonwebtoken";
import { capitalize } from "lodash";
import { ObjectId } from "mongodb";
import { UserVerifyStatus } from "~/constants/enum";
import httpStatus from "~/constants/httpStatus";
import { usersMessage } from "~/constants/messages";
import { REGEX_USERNAME } from "~/constants/regex";
import databaseService from "~/database/database";
import { ErrorWithStatus } from "~/models/Errors";
import { TokenPayload } from "~/models/requests/User.requests";
import usersService from "~/services/users.services";
import { verifyToken } from "~/utils/jwt";

const passwordSchema: ParamSchema = {
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
};

const confirmPasswordSchema: ParamSchema = {
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
};

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: usersMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: httpStatus.UNAUTHOZIZED,
        });
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env
            .JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
        });

        const { user_id } = decoded_forgot_password_token;

        const user = await databaseService.users.findOne({
          _id: new ObjectId(user_id),
        });

        if (user === null) {
          throw new ErrorWithStatus({
            message: usersMessage.USER_NOT_FOUND,
            status: httpStatus.UNAUTHOZIZED,
          });
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: usersMessage.INVALID_FORGOT_PASSWORD_TOKEN,
            status: httpStatus.UNAUTHOZIZED,
          });
        }
        req.decoded_forgot_password_token = decoded_forgot_password_token;
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
};

const nameSchema: ParamSchema = {
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
};

const imageSchema = {
  optional: true,
  isString: {
    errorMessage: usersMessage.IMAGE_URL_MUST_BE_STRING,
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400,
    },
    errorMessage: usersMessage.IMAGE_URL_LENGTH,
  },
};

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true,
    },
    errorMessage: usersMessage.DATE_OF_BIRTH_MUST_BE_ISO8601,
  },
};

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: usersMessage.INVALID_USER_ID,
          status: httpStatus.NOT_FOUND,
        });
      }
      const follwed_user = await databaseService.users.findOne({
        _id: new ObjectId(value),
      });

      if (follwed_user === null) {
        throw new ErrorWithStatus({
          message: usersMessage.USER_NOT_FOUND,
          status: httpStatus.NOT_FOUND,
        });
      }
    },
  },
};

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
    name: nameSchema,

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

    password: passwordSchema,

    confirm_password: confirmPasswordSchema,

    date_of_birth: dateOfBirthSchema,
  },
  ["body"]
);

export const accessTokenValidator = checkSchema(
  {
    Authorization: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          const access_token = (value || " ").split(" ")[1];
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
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: usersMessage.REFRESH_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHOZIZED,
            });
          }
          try {
            const [decoded_refresh_token, refresh_token] = await Promise.all([
              verifyToken({
                token: value,
                secretOrPublicKey: process.env
                  .JWT_SECRET_REFRESH_TOKEN as string,
              }),
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

export const emailVerifyTokenValidator = checkSchema(
  {
    email_verify_token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: usersMessage.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHOZIZED,
            });
          }
          try {
            const decoded_email_verify_token = await verifyToken({
              token: value,
              secretOrPublicKey: process.env
                .JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
            });

            (req as Request).decoded_email_verify_token =
              decoded_email_verify_token;
          } catch (error) {
            throw new ErrorWithStatus({
              message: capitalize((error as JsonWebTokenError).message),
              status: httpStatus.UNAUTHOZIZED,
            });
          }

          return true;
        },
      },
    },
  },
  ["body"]
);

export const forgotPasswordValidator = checkSchema(
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
            throw new Error(usersMessage.USER_NOT_FOUND);
          }

          req.user = user;
          return true;
        },
      },
    },
  },
  ["body"]
);

export const verifyForgotPasswordTokenValidator = checkSchema(
  {
    forgot_password_token: forgotPasswordTokenSchema,
  },
  ["body"]
);

export const resetPasswordValidator = checkSchema(
  {
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    forgot_password_token: forgotPasswordTokenSchema,
  },
  ["body"]
);

export const verifiedUserValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { verify } = req.decoded_authorization as TokenPayload;
  if (verify !== UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      message: usersMessage.USER_NOT_VERIFIED,
      status: httpStatus.FORBIDDEN,
    });
  }
  next();
};

export const updateMeValidator = checkSchema(
  {
    name: {
      ...nameSchema,
      optional: true,
      notEmpty: undefined,
    },
    date_of_birth: {
      ...dateOfBirthSchema,
      optional: true,
    },
    bio: {
      optional: true,
      isString: {
        errorMessage: usersMessage.BIO_MUST_BE_STRING,
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 200,
        },
        errorMessage: usersMessage.BIO_LENGTH,
      },
    },

    location: {
      optional: true,
      isString: {
        errorMessage: usersMessage.LOCATION_MUST_BE_STRING,
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 200,
        },
        errorMessage: usersMessage.LOCATION_LENGTH,
      },
    },

    website: {
      optional: true,
      isString: {
        errorMessage: usersMessage.WEBSITE_MUST_BE_STRING,
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 200,
        },
        errorMessage: usersMessage.WEBSITE_LENGTH,
      },
    },

    username: {
      optional: true,
      isString: {
        errorMessage: usersMessage.USERNAME_MUST_BE_STRING,
      },
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!REGEX_USERNAME.test(value)) {
            throw Error(usersMessage.USERNAME_INVALID);
          }
          const user = await databaseService.users.findOne({
            username: value,
          });
          // neu da ton tai username nay trong database
          // thi chung ta khong cho update
          if (user) {
            throw Error(usersMessage.USERNAME_EXISTED);
          }
        },
      },
    },

    avatar: imageSchema,

    cover_photo: imageSchema,
  },
  ["body"]
);

export const followValidator = checkSchema(
  {
    followed_user_id: userIdSchema,
  },
  ["body"]
);

export const unfollowValidator = checkSchema(
  {
    user_id: userIdSchema,
  },
  ["params"]
);

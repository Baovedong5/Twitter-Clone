import { Request, Response, NextFunction } from "express";

import { checkSchema } from "express-validator";
import { usersMessage } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/Errors";
import usersService from "~/services/users.services";

export const loginValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: "Missing email or password",
    });
  }
  next();
};

export const registerValidator = checkSchema({
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
});

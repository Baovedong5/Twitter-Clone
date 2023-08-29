export const usersMessage = {
  VALIDATION_ERROR: "Validation error",

  EMAIL_ALREADY_EXISTS: "Email already exists",
  NAME_IS_REQUIRED: "Name is required",
  NAME_MUST_BE_A_STRING: "Name must be a string",
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: "Name length must a from 1 to 100",

  EMAIL_OR_PASSWORD_IS_INCORRECT: "Email or password is incorrect",

  EMAIL_IS_REQUIRED: "Email is required",
  EMAIL_IS_INVALID: "Email is invalid",

  PASSOWRD_IS_REQUIRED: "Password is required",
  PASSOWRD_MUST_BE_A_STRING: "Password must be a string",
  PASSOWRD_LENGTH_MUST_BE_FROM_6_TO_50: "Password length must a from 1 to 100",
  PASSOWRD_MUST_BE_STRONG:
    "Password must be at least 6 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol",

  CONFIRM_PASSOWRD_IS_REQUIRED: "Confirm_password is required",
  CONFIRM_PASSOWRD_MUST_BE_A_STRING: "Confirm_password must be a string",
  CONFIRM_PASSOWRD_LENGTH_MUST_BE_FROM_6_TO_50:
    "Confirm_password length must a from 1 to 100",
  CONFIRM_PASSOWRD_MUST_BE_STRONG:
    "Password must be at least 6 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol",
  CONFIRM_PASSOWRD_MUST_BE_THE_SAME_PASSWORD:
    "Password confirmation does not math password",

  DATE_OF_BIRTH_MUST_BE_ISO8601: "date of birth must be ISO8601",

  LOGIN_SUCCESS: "Login succsess",
  REGISTER_SUCCESS: "Register success",

  ACCESS_TOKEN_IS_REQUIRED: "Access_token is required",
  ACCESS_TOKEN_IS_INVALID: "Access_token is invalid",

  REFRESH_TOKEN_IS_REQUIRED: "Refresh_token is required",
  REFRESH_TOKEN_IS_INVALID: "Refresh_token is invalid",

  USE_REFRESH_TOKEN_OR_NOT_EXIST: "Use refresh_token or not exist",
  USER_NOT_FOUND: "User not found",

  LOGOUT_SUCCESS: "Logout success",

  EMAIL_VERIFY_TOKEN_IS_REQUIRED: "Email verify token is required",
  EMAIL_ALREADY_VERIFIED: "Email already verified",
  EMAIL_VERIFY_SUCCESS: "Email verify success",

  RESEND_VERIRY_EMAIL_SUCCESS: "Resend verify email succsess",
  CHECK_EMAIL_TO_RESET_PASSWORD: "Check email to reset password",

  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: "Forgot password token is required",
  VERIFY_FORGOT_PASSWORD_SUCCESS: "Verify forgot password success",
  INVALID_FORGOT_PASSWORD_TOKEN: "Invalid forgot password token",

  RESET_PASSWORD_SUCCESS: "Rest pasword success",

  GET_ME_SUCCESS: "Get profile success",
  USER_NOT_VERIFIED: "User not verified",

  BIO_MUST_BE_STRING: "Bio must be string",
  BIO_LENGTH: "Bio length must be from 1 to 200",

  LOCATION_MUST_BE_STRING: "Location must be string",
  LOCATION_LENGTH: "Location length must be from 1 to 200",

  WEBSITE_MUST_BE_STRING: "Website must be string",
  WEBSITE_LENGTH: "Website length must be from 1 to 200",

  USERNAME_MUST_BE_STRING: "Username must be string",
  USERNAME_LENGTH: "Username length must be from 1 to 50",

  IMAGE_URL_MUST_BE_STRING: "Image url must be string",
  IMAGE_URL_LENGTH: "Image ur length must be from 1 to 400",

  UPDATE_ME_SUCCESS: "Update me succsess",
} as const;

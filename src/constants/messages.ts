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
} as const;

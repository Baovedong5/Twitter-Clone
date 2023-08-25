import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

export const hashPassword = (password: string) => {
  let hashPasswordUser = bcrypt.hashSync(password, salt);
  return hashPasswordUser;
};

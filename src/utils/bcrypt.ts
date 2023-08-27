import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

export const hashPassword = (password: string) => {
  let hashPasswordUser = bcrypt.hashSync(password, salt);
  return hashPasswordUser;
};

export const comparePassword = (password: string, hashPassword: string) => {
  return bcrypt.compareSync(password, hashPassword);
};

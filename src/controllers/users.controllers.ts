import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import { RegisterReqBody } from "~/models/requests/User.requests";
import usersService from "~/services/users.services";

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === "phuong@gmail.com" && password === 123456) {
    return res.status(200).json({
      message: "Login succsess",
    });
  }
  return res.status(400).json({
    error: "Login failed",
  });
};

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response
) => {
  try {
    const result = await usersService.register(req.body);
    return res.status(200).json({
      message: "Register success",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Register failed",
      error,
    });
  }
};

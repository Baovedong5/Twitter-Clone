import { Request, Response } from "express";
import databaseService from "~/database/database";
import User from "~/models/User.schemas";
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

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await usersService.register({ email, password });
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

import { validate } from "class-validator";
import { User } from "../Entities/User";
import { CreateUser } from "../interfaces/createUser";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signUp = async (req: Request, res: Response) => {
  const body = req.body as CreateUser;
  try {
    const existingUser = await User.findOneBy({ email: body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: `User with email ${body.email} already exists` });
    }

    const user = User.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
    });

    const errors = await validate(user);
    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    const { password, topics, ...returnedData } = await user.save();

    return res.status(201).json(returnedData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error encountered while saving data" });
  }
};

export const login = async (req: Request, res: Response) => {
  const body = req.body as { email: string; password: string };
  if (!body.email || !body.password) {
    return res
      .status(400)
      .json({ message: "email and password are required." });
  }
  try {
    const user = await User.findOneBy({ email: body.email });
    if (!user) {
      return res
        .status(404)
        .json({ message: `User with email ${body.email} does not exist` });
    }

    const isCorrectPassword = await bcrypt.compare(
      body.password,
      user.password
    );
    if (!isCorrectPassword)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign(
      { userId: user.id, userSignUpdate: user.createdAt },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.log("ERROR logging in", JSON.stringify(error));
    return res.status(500).json({
      message: "An error encountered while logging in",
    });
  }
};

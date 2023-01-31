import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import AuthenticationTokenMissingException from "../exceptions/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import UserModel from "../users/user.model";

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      next(new WrongAuthenticationTokenException());
    }
    const token = header.replace("Bearer ", "");
    if (!token) {
      next(new AuthenticationTokenMissingException());
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as DataStoredInToken;
    const user = await UserModel.findOne({ id: decoded.id });
    if (!user) {
      next(new AuthenticationTokenMissingException());
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}

export default authMiddleware;

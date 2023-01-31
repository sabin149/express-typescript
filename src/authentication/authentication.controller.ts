import * as bcrypt from "bcrypt";
import * as express from "express";
import * as jwt from "jsonwebtoken";
import User from "users/user.interface";
import UserWithThatEmailAlreadyExistsException from "../exceptions/UserWithThatEmailAlreadyExistsException";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import Controller from "../interfaces/controller.interface";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import TokenData from "../interfaces/tokenData.interface";
import validationMiddleware from "../middleware/validation.middleware";
import CreateUserDto from "../users/user.dto";
import userModel from "./../users/user.model";
import LogInDto from "./logIn.dto";

class AuthenticationController implements Controller {
  public path = "/auth";
  public router = express.Router();
  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(CreateUserDto),
      this.registration
    );
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(LogInDto),
      this.loggingIn
    );
    this.router.post(`${this.path}/logout`, this.loggingOut);
  }

  private registration = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const userData: CreateUserDto = request.body;
    const existingUser = await this.user
      .findOne({ email: userData.email })
      .select("-__v")
      .lean()
      .exec();
    if (existingUser) {
      next(new UserWithThatEmailAlreadyExistsException(userData.email));
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.user.create({
        ...userData,
        password: hashedPassword,
      });
      user.password = undefined;
      const tokenData = this.createAccessToken(user);
      response.status(201).json({ user, token: tokenData.token });
    }
  };

  private loggingIn = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const logInData: LogInDto = request.body;
    const user = await this.user
      .findOne({ email: logInData.email })
      .select("-__v")
      .lean()
      .exec();
    if (user) {
      const isPasswordMatching = await bcrypt.compare(
        logInData.password,
        user.password
      );
      if (isPasswordMatching) {
        user.password = undefined;
        const tokenData = this.createAccessToken(user);
        response.status(201).json({ user, token: tokenData.token });
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };

  private loggingOut = (_req: express.Request, res: express.Response) => {
    res.clearCookie("Authorization");
    res.status(200).json({ message: "Logout Successfully" });
  };

  private generateRefreshToken(req: express.Request, res: express.Response) {
    try {
      const rfToken = req.cookies.refreshtoken;
      if (!rfToken) {
        return res.status(400).json({ message: "Please Login or Register" });
      }
      jwt.verify(rfToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
          return res.status(400).json({ message: "Please Login or Register" });
        }
        const accessToken = this.createAccessToken(user);
        res.status(201).json({ accessToken });
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  private createAccessToken(user: User): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      id: user._id,
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }
}

export default AuthenticationController;

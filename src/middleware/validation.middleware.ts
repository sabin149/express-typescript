import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import * as express from "express";
import HttpException from "../exceptions/HttpException";

const validationMiddleware =
  <T>(type: any, skipMissingProperties = false) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    validate(plainToInstance(type, req.body), { skipMissingProperties })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors
            .map((error: ValidationError) => Object.values(error.constraints))
            .join(", ");
          next(new HttpException(400, message));
        } else {
          next();
        }
      })
      .catch(() => {
        next(new HttpException(400, "Invalid request"));
      });
  };

export default validationMiddleware;

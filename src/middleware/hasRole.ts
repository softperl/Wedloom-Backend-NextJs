import { UnAuthenticatedError } from "../errors";
import { Response, NextFunction, Request } from "express";

UnAuthenticatedError;
export default function hasRole(roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!res.locals.user.role || !roles.includes(res.locals.user.role)) {
      throw new UnAuthenticatedError("Authentication Invalid");
    }
    next();
  };
}

import { get } from "lodash";
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.utils";
import { reIssueAccessToken } from "../services/session.service";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = get(req, "headers.authorization", "").replace(
    /^Bearer\s/,
    ""
  );

  const refreshToken = get(req, "headers.x-refresh-token");

  if (!accessToken) {
    return next();
  }

  const { decoded, expired } = verifyJwt(
    accessToken,
    "ACCESS_TOKEN_PUBLIC_KEY"
  );

  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

  if (expired && refreshToken) {
    console.log("Access token expired! Creating new one...");

    const newAccessToken = await reIssueAccessToken({
      refreshToken: `${refreshToken}`,
    });

    if (newAccessToken) {
      res.setHeader("x-access-token", newAccessToken);
    }

    const result = verifyJwt(
      newAccessToken as string,
      "ACCESS_TOKEN_PUBLIC_KEY"
    );

    res.locals.user = result.decoded;
    return next();
  }

  return next();
};

export default deserializeUser;

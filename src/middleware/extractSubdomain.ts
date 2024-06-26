import { Request, Response, NextFunction } from "express";

const extractSubdomain = (req: any, res: Response, next: NextFunction) => {
  const parts = req.hostname.split(".");
  const subdomain = parts.length > 2 ? parts[0] : null;
  req.subdomain = subdomain;
  console.log(parts);

  next();
};

export default extractSubdomain;

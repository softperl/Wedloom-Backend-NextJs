import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaults = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = defaults.body;
      req.query = defaults.query;
      req.params = defaults.params;
      next();
    } catch (e: any) {
      return res.status(400).send(e.errors);
    }
  };

export default validate;

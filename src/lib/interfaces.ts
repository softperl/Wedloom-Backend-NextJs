import { Request } from "express";

export interface IGetAdminAuthInfoRequest extends Request {
  admin: {
    id: string;
    role: string;
  };
}

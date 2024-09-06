import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { reIssueAccessToken } from "../services/session.service";
import { signJwt } from "../utils/jwt.utils";
import {
  changePasswordVendorSchema,
  loginSchema,
  registerSchema,
} from "../schema/auth.schema";
import bc from "bcryptjs";
import { mailQueue } from "../jobs/queue";
import jwt from "jsonwebtoken";

async function signUp(req: Request, res: Response) {
  try {
    const { name, email, phone, password, brand, city, vendorType, role } =
      registerSchema.parse(req.body);
    const emailAlreadyExists = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });
    if (emailAlreadyExists) {
      throw new BadRequestError("Email already exists!");
    }
    const hashedPassword = await bc.hash(`${password}`, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        brand,
        city,
        vendorType,
        role,
      },
    });
    await mailQueue.add(
      `new-account-created`,
      {
        name,
        email,
        queueType: "NEW-ACCOUNT-CREATED",
      },
      {
        jobId: `new-account-created-${email}`,
      }
    );
    res.status(StatusCodes.OK).json({ user });
  } catch (error: any) {
    console.log(error);
    throw new BadRequestError(
      error.message || error.msg || "Something went wrong"
    );
  }
}

async function login(req: any, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLocaleLowerCase(),
      },
    });
    if (!existingUser) {
      throw new BadRequestError("User not found!");
    }
    if (!existingUser.password) {
      throw new BadRequestError("Please use social login!");
    }
    const isPasswordCorrect = await bc.compare(
      password,
      existingUser.password as string
    );
    if (!isPasswordCorrect) {
      throw new BadRequestError("Invalid credentials!");
    }
    if (!existingUser.verified) {
      throw new BadRequestError("Please verify your email!");
    }
    const session = await prisma.session.create({
      data: {
        userId: existingUser.id,
        userAgent: req.headers["user-agent"] || "",
      },
    });
    const data = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      session: session.id,
    };
    const refreshToken = signJwt(data, "REFRESH_TOKEN_PRIVATE_KEY", {
      expiresIn: process.env.REFRESH_TOKEN_TTL,
    });
    const accessToken = signJwt(
      data,
      "ACCESS_TOKEN_PRIVATE_KEY",
      { expiresIn: process.env.ACCESS_TOKEN_TTL } // 15 minutes
    );

    res.status(StatusCodes.OK).json({
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.log(error);
    throw new BadRequestError(
      error.message || error.msg || "Something went wrong"
    );
  }
}
async function loginAdmin(req: any, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLocaleLowerCase(),
      },
    });
    if (!existingUser) {
      throw new BadRequestError("User not found!");
    }
    const allowedRoles = ["Admin", "Super"];
    if (!allowedRoles.includes(existingUser?.role || "")) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    if (!existingUser.password) {
      throw new BadRequestError("Please use social login!");
    }
    const isPasswordCorrect = await bc.compare(
      password,
      existingUser.password as string
    );
    if (!isPasswordCorrect) {
      throw new BadRequestError("Invalid credentials!");
    }
    if (!existingUser.verified) {
      throw new BadRequestError("Please verify your email!");
    }
    const session = await prisma.session.create({
      data: {
        userId: existingUser.id,
        userAgent: req.headers["user-agent"] || "",
      },
    });
    const data = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      session: session.id,
    };
    const refreshToken = signJwt(data, "REFRESH_TOKEN_PRIVATE_KEY", {
      expiresIn: process.env.REFRESH_TOKEN_TTL,
    });
    const accessToken = signJwt(
      data,
      "ACCESS_TOKEN_PRIVATE_KEY",
      { expiresIn: process.env.ACCESS_TOKEN_TTL } // 15 minutes
    );

    res.status(StatusCodes.OK).json({
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.log(error);
    throw new BadRequestError(
      error.message || error.msg || "Something went wrong"
    );
  }
}

async function changePasswordVendor(req: Request, res: Response) {
  try {
    const { oldPassword, newPassword } = changePasswordVendorSchema.parse(
      req.body
    );

    const userId = res.locals.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestError("User not found!");
    }

    const isPasswordCorrect = await bc.compare(
      oldPassword,
      user.password as string
    );

    if (!isPasswordCorrect) {
      throw new BadRequestError("Old password is incorrect!");
    }

    const hashedNewPassword = await bc.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.status(StatusCodes.OK).json({ msg: "Password changed successfully" });
  } catch (error: any) {
    console.log(error);
    throw new BadRequestError(error.message || "Something went wrong");
  }
}

async function deleteSession(req: Request, res: Response) {
  const sessionId = res.locals.user.session;
  try {
    await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        valid: false,
      },
    });
    res.status(StatusCodes.OK).json({
      accessToken: null,
      refreshToken: null,
    });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
}

async function getRole(req: Request, res: Response) {
  const userId = res.locals.user.id;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });
    res.status(StatusCodes.OK).json({ role: user?.role });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
}

async function renewAccessToken(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new UnAuthenticatedError("Please provide a refresh token");
  }
  const newAccessToken = await reIssueAccessToken({
    refreshToken: `${refreshToken}`,
  });

  if (!newAccessToken) {
    throw new UnAuthenticatedError("Invalid refresh token");
  }

  res.status(StatusCodes.OK).json({ accessToken: newAccessToken });
}

async function getUserSessions(req: Request, res: Response) {
  const userId = res.locals.user.id;
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      valid: true,
    },
    take: 20,
  });
  res.status(StatusCodes.OK).json({ sessions });
}

const verify = async (req: any, res: Response) => {
  try {
    const { token } = req.params;
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded) {
      throw new UnAuthenticatedError("Invalid token");
    }
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });
    if (!user) {
      throw new UnAuthenticatedError("Invalid token");
    }
    if (user.verified) {
      throw new BadRequestError("Email already verified");
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { verified: true },
    });
    res.status(StatusCodes.OK).json({ msg: "Email verified" });
  } catch (error) {
    throw new BadRequestError("Invalid token");
  }
};

export {
  deleteSession,
  renewAccessToken,
  getUserSessions,
  login,
  getRole,
  signUp,
  verify,
  loginAdmin,
  changePasswordVendor,
};

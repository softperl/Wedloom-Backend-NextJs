import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";

const createPayment = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const {
    id,
    packageName,
    amount,
    quantity,
    customerName,
    customerEmail,
    customerNumber,
    vendorId,
    currency,
  } = req.body;

  if (
    !id ||
    !vendorId ||
    !amount ||
    !quantity ||
    !customerName ||
    !customerEmail ||
    !customerNumber ||
    !packageName ||
    !currency
  ) {
    throw new BadRequestError("Please provide all the required fields");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
      role: "User",
    },
  });

  if (!user) {
    throw new UnAuthenticatedError("User not found");
  }

  try {
    await prisma.payment.upsert({
      where: {
        id,
      },
      update: {
        amount,
        quantity,
        customerName,
        customerEmail,
        customerNumber,
        packageName,
        userId,
        vendorId,
        status: "Pending",
        currency,
      },
      create: {
        amount,
        quantity,
        customerName,
        customerEmail,
        customerNumber,
        packageName,
        userId,
        vendorId,
        status: "Pending",
        currency,
      },
    });
    res.status(StatusCodes.OK).json();
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

export { createPayment };

import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { newLegalSchema } from "../schema/site.schema";

const newTerms = async (req: Request, res: Response) => {
  try {
    const data = newLegalSchema.parse(req.body);
    const terms = await prisma.term.upsert({
      where: {
        id: data.id || 0,
      },
      create: {
        title: data.title,
        content: data.content,
        siteId: 0,
        status: data.status,
      },
      update: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.status && { status: data.status }),
      },
    });
    res.status(StatusCodes.OK).json({ terms });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newPrivacy = async (req: Request, res: Response) => {
  try {
    const data = newLegalSchema.parse(req.body);
    const terms = await prisma.privacy.upsert({
      where: {
        id: data.id || 0,
      },
      create: {
        title: data.title,
        content: data.content,
        siteId: 0,
        status: data.status,
      },
      update: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.status && { status: data.status }),
      },
    });
    res.status(StatusCodes.OK).json({ terms });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newRefund = async (req: Request, res: Response) => {
  try {
    const data = newLegalSchema.parse(req.body);
    const terms = await prisma.refund.upsert({
      where: {
        id: data.id || 0,
      },
      create: {
        title: data.title,
        content: data.content,
        siteId: 0,
        status: data.status,
      },
      update: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.status && { status: data.status }),
      },
    });
    res.status(StatusCodes.OK).json({ terms });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const deleteTerms = async (req: Request, res: Response) => {
  try {
    await prisma.term.deleteMany();
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};
const deletePrivacy = async (req: Request, res: Response) => {
  try {
    await prisma.privacy.deleteMany();
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const deleteRefund = async (req: Request, res: Response) => {
  try {
    await prisma.refund.deleteMany();
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getTerms = async (req: Request, res: Response) => {
  try {
    const terms = await prisma.term.findFirst({
      where: {
        siteId: 0,
      },
    });
    res.status(StatusCodes.OK).json({ terms });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getPrivacy = async (req: Request, res: Response) => {
  try {
    const privacy = await prisma.privacy.findFirst({
      where: {
        siteId: 0,
      },
    });
    res.status(StatusCodes.OK).json({ privacy });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getRefund = async (req: Request, res: Response) => {
  try {
    const refund = await prisma.refund.findFirst({
      where: {
        siteId: 0,
      },
    });
    res.status(StatusCodes.OK).json({ refund });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

export {
  newTerms,
  newPrivacy,
  newRefund,
  deleteTerms,
  deletePrivacy,
  deleteRefund,
  getTerms,
  getPrivacy,
  getRefund,
};

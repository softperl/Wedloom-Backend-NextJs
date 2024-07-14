import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";

import { z } from "zod";
import { getAllSchema } from "./adminAuthController";

const contactSchema = z.object({
  name: z.string().max(64),
  subject: z.string().max(128),
  email: z.string().email().max(128),
  message: z.string().max(1024),
});

async function newContact(req: Request, res: Response) {
  const user = res.locals.user;

  try {
    const data = contactSchema.parse(req.body);
    const contact = await prisma.contact.create({
      data: {
        name: data.name,
        subject: data.subject,
        email: data.email,
        message: data.message,
        type: user.role,
      },
    });
    res.status(StatusCodes.OK).json({ contact });
  } catch (error: any) {
    console.log(error);
    throw new BadRequestError(
      error.message || error.msg || "Something went wrong"
    );
  }
}

async function changeStatus(req: Request, res: Response) {
  const { status, id } = req.body;
  try {
    const contact = await prisma.contact.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
    res.status(StatusCodes.OK).json({ contact });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
}

async function deleteContact(req: Request, res: Response) {
  const { contactId } = req.params;
  try {
    const contact = await prisma.contact.delete({
      where: {
        id: contactId,
      },
    });
    res.status(StatusCodes.OK).json({ contact });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
}

async function getContacts(req: Request, res: Response) {
  try {
    let { q, page, perPage, sortBy, sortOrder } = getAllSchema.parse(req.query);
    const offset = (parseInt(`${page}`) - 1) * parseInt(`${perPage}`);
    let whereCondition = {};
    if (q) {
      whereCondition = {
        OR: [{ message: { contains: q, mode: "insensitive" } }],
      };
    }

    const [contacts, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: {
          ...whereCondition,
        },

        skip: offset,
        take: parseInt(`${perPage}`),
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.contact.count({
        where: {
          ...whereCondition,
        },
      }),
    ]);
    const totalPages = Math.ceil(totalCount / parseInt(`${perPage}`));
    res.status(StatusCodes.OK).json({
      contacts,
      total: totalCount,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
}

export { newContact, changeStatus, deleteContact, getContacts };

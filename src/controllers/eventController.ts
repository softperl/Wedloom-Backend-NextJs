import prisma from "@/src/lib/prisma";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { BadRequestError } from "../errors";
import { getAllSchema } from "./adminAuthController";

const eventSchema = z.object({
  type: z.enum(["Groom", "Bride"]).default("Groom"),
  title: z.string(),
  location: z.string(),
  date: z.string(),
});

async function newEvent(req: Request, res: Response) {
  const userId = res.locals.user.id;
  try {
    const data = eventSchema.parse(req.body);
    const eventDate = new Date(data.date);
    if (eventDate <= new Date()) {
      throw new BadRequestError("Event date must be a future date");
    }
    await prisma.event.create({
      data: {
        type: data.type,
        title: data.title,
        location: data.location,
        date: data.date,
        userId,
      },
    });
    res.status(StatusCodes.OK).json();
  } catch (error: any) {
    console.log(error);
    throw new BadRequestError(
      error.message || error.msg || "Something went wrong"
    );
  }
}

async function deleteEvent(req: Request, res: Response) {
  const { eventId } = req.params;
  try {
    const event = await prisma.event.delete({
      where: {
        id: eventId,
      },
    });
    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
}

async function getAllEventsByUserId(req: Request, res: Response) {
  try {
    const userId = res.locals.user.id;
    let { q, page, perPage, sortBy, sortOrder } = getAllSchema.parse(req.query);
    const offset = (parseInt(`${page}`) - 1) * parseInt(`${perPage}`);
    let whereCondition: any = { userId };
    if (q) {
      whereCondition.OR = [{ event: { contains: q, mode: "insensitive" } }];
    }

    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where: {
          ...whereCondition,
        },

        skip: offset,
        take: parseInt(`${perPage}`),
        orderBy: {
          createdAt: sortOrder === "asc" ? "asc" : "desc",
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
      events,
      total: totalCount,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
}

export { newEvent, deleteEvent, getAllEventsByUserId };

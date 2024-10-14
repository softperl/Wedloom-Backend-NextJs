import { Request, Response } from "express";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import prisma from "@/src/lib/prisma";

export const getAllSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(200).default(10),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  q: z.string().optional(),
});

const getAllUsers = async (req: Request, res: Response) => {
  const { role } = req.query;

  try {
    let { q, page, perPage, sortBy, sortOrder } = getAllSchema.parse(req.query);
    const offset = (parseInt(`${page}`) - 1) * parseInt(`${perPage}`);
    let whereCondition: any = {
      role,
    };

    if (q) {
      whereCondition = {
        ...whereCondition,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        skip: offset,
        take: parseInt(`${perPage}`),
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.user.count({
        where: whereCondition,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(`${perPage}`));
    res.status(StatusCodes.OK).json({
      users,
      total: totalCount,
      totalPages,
    });
  } catch (error: any) {
    console.log(error);
    throw new BadRequestError(error || "Something went wrong");
  }
};

export { getAllUsers };

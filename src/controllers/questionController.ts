import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { mailQueue } from "../jobs/queue";
import { newCategorySchema, newPostSchema } from "../schema/post.schema";
import { getAllSchema } from "./adminAuthController";
import { generateUniqueSlug } from "../utils/general.utils";

const newQuestion = async (req: any, res: Response) => {
  const {
    question,
    questionType,
    vendorType,
    inputType,
    labelName,
    showLabel,
    others,
  } = req.body;

  try {
    await prisma.questions.create({
      data: {
        question,
        questionType,
        vendorType,
        inputType,
        labelName,
        showLabel,
        others,
      },
    });
    res.status(StatusCodes.CREATED).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const deleteQuestion = async (req: Request, res: Response) => {
  const { questionId } = req.params;
  try {
    await prisma.questions.delete({
      where: {
        id: questionId,
      },
    });
    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getQuestionById = async (req: Request, res: Response) => {
  const { questionId } = req.params;

  try {
    const question = await prisma.questions.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      throw new BadRequestError("Question not found");
    }

    res.status(StatusCodes.OK).json({ question });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const editQuestion = async (req: Request, res: Response) => {
  const { questionId } = req.params;
  const {
    question,
    questionType,
    vendorType,
    inputType,
    labelName,
    showLabel,
    others,
  } = req.body;

  try {
    await prisma.questions.update({
      where: {
        id: questionId,
      },
      data: {
        question,
        questionType,
        vendorType,
        inputType,
        labelName,
        showLabel,
        others,
      },
    });
    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

async function getAllQuestions(req: Request, res: Response) {
  try {
    let { q, page, perPage, sortBy, sortOrder } = getAllSchema.parse(req.query);
    const offset = (parseInt(`${page}`) - 1) * parseInt(`${perPage}`);
    let whereCondition = {};
    if (q) {
      whereCondition = {
        OR: [{ event: { contains: q, mode: "insensitive" } }],
      };
    }

    const [questions, totalCount] = await Promise.all([
      prisma.questions.findMany({
        where: {
          ...whereCondition,
        },

        skip: offset,
        take: parseInt(`${perPage}`),
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.questions.count({
        where: {
          ...whereCondition,
        },
      }),
    ]);
    const totalPages = Math.ceil(totalCount / parseInt(`${perPage}`));
    res.status(StatusCodes.OK).json({
      questions,
      total: totalCount,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
}

export {
  newQuestion,
  getQuestionById,
  editQuestion,
  deleteQuestion,
  getAllQuestions,
};

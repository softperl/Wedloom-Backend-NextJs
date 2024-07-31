import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { mailQueue } from "../jobs/queue";
import { newCategorySchema, newPostSchema } from "../schema/post.schema";
import { getAllSchema } from "./adminAuthController";
import { generateUniqueSlug } from "../utils/general.utils";

const newQuestion = async (req: any, res: Response) => {
  const { name, inputType, vendorType, label } = req.body;

  try {
    await prisma.questions.create({
      data: {
        name,
        inputType,
        vendorType,
        label,
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

const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await prisma.questions.findMany();
    res.status(StatusCodes.OK).json({ questions });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

export { newQuestion, deleteQuestion, getAllQuestions };

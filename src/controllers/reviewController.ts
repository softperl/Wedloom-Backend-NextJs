import { get } from "lodash";
import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";

const createReview = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { vendorId, rating, feedback, feedBackQuestion } = req.body;

  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }

    const isVendor = await prisma.user.findUnique({
      where: {
        id: vendorId,
        role: "Vendor",
      },
    });

    if (!isVendor) {
      throw new BadRequestError("Vendor not found");
    }

    await prisma.review.create({
      data: {
        userId,
        rating,
        feedback,
        feedBackQuestion,
        vendorId,
      },
    });
    res.status(StatusCodes.OK).json({ message: "Review added" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const reviewReply = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { reviewId, reply } = req.body;

  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      throw new BadRequestError("Review not found");
    }

    if (review.vendorId !== userId) {
      throw new UnAuthenticatedError("Not allowed");
    }

    await prisma.review.update({
      where: {
        id: reviewId,
        reply: null,
      },
      data: {
        reply,
      },
    });

    res.status(StatusCodes.OK).json({ message: "Reply added" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getReviews = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }

    const reviews = await prisma.review.findMany({
      where: {
        vendorId: userId,
      },
    });

    const reviewsCount = await prisma.review.count({
      where: {
        vendorId: userId,
      },
    });

    res.status(StatusCodes.OK).json({ reviews, reviewsCount });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getPublicReviews = async (req: Request, res: Response) => {
  const { vendorId } = req.body;
  try {
    if (!vendorId) {
      throw new BadRequestError("Vendor not found");
    }

    const reviews = await prisma.review.findMany({
      where: {
        vendorId,
      },
    });

    res.status(StatusCodes.OK).json({ reviews });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

export { createReview, reviewReply, getReviews, getPublicReviews };

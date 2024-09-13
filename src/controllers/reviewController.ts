import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";

const createReview = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { vendorId, rating, feedback, feedBackQuestion, isShare, photos } =
    req.body;

  if (!rating || !feedback || !feedBackQuestion) {
    throw new BadRequestError("All fields are required");
  }
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
    const isAlreadyConversation = await prisma.conversation.findFirst({
      where: {
        users: {
          some: {
            userId,
          },
        },
        AND: {
          users: {
            some: {
              userId: vendorId,
            },
          },
        },
      },
    });
    if (!isAlreadyConversation) {
      throw new BadRequestError(
        "You need to have a conversation with the vendor before you can review them"
      );
    }
    const isVendorReplyMessage = await prisma.message.findFirst({
      where: {
        conversationId: isAlreadyConversation.id,
        senderId: vendorId,
      },
    });
    if (!isVendorReplyMessage) {
      throw new BadRequestError(
        "Vendor needs to reply to your message before you can review them"
      );
    }
    await prisma.review.create({
      data: {
        vendorId,
        userId,
        rating,
        feedback,
        feedBackQuestion,
        isShare,
        photos,
      },
    });
    res.status(StatusCodes.OK).json();
  } catch (error: any) {
    console.log(error);
    throw new BadRequestError(error.message || "Something went wrong");
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

    res.status(StatusCodes.OK).json({});
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
      include: {
        user: true,
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
  const { vendorId } = req.params;
  try {
    if (!vendorId) {
      throw new BadRequestError("Something went wrong");
    }
    const isVendor = await prisma.user.findUnique({
      where: {
        id: vendorId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      res.status(StatusCodes.OK).json({ reviews: [] });
      return;
    }
    const reviews = await prisma.review.findMany({
      where: {
        vendorId,
      },
      include: {
        user: true,
      },
    });

    res.status(StatusCodes.OK).json({ reviews });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

export { createReview, reviewReply, getReviews, getPublicReviews };

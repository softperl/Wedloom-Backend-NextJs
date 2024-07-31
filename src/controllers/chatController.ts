import { Request, Response } from "express";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import prisma from "@/src/lib/prisma";
import { io } from "..";

const createConversation = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { receiverId } = req.params;
  try {
    const extConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            users: {
              some: {
                userId,
              },
            },
          },
          {
            users: {
              some: {
                userId: receiverId,
              },
            },
          },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 100,
        },
        users: true,
      },
    });

    if (extConversation) {
      return res.status(StatusCodes.OK).json({ conversation: extConversation });
    } else {
      const newConversation = await prisma.conversation.create({
        data: {
          key: `${userId}${receiverId}`,
          users: {
            create: [
              {
                userId,
              },
              {
                userId: receiverId,
              },
            ],
          },
        },
        include: {
          messages: true,
          users: true,
        },
      });
      res.status(StatusCodes.OK).json({
        conversation: newConversation,
        new: true,
      });
    }
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getConversationsByUser = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        users: true,
      },
    });
    res.status(StatusCodes.OK).json({ conversations });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const createMessage = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { text, conversationId } = req.body;
  if (!conversationId || !text) {
    throw new BadRequestError("Invalid request!");
  }
  try {
    const message = await prisma.message.create({
      data: {
        text,
        conversationId,
        senderId: userId,
      },
      include: {
        conversation: {
          select: {
            users: true,
          },
        },
      },
    });
    const receiverId = message.conversation.users.find(
      (user) => user.userId !== userId
    )?.userId;
    io.emit(`new-message-${conversationId}-${receiverId}`, { message });
    res.status(StatusCodes.OK).json({ message });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getMessages = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    res.status(StatusCodes.OK).json({ messages });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const deleteConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  try {
    await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });
    res.status(StatusCodes.OK).json({ msg: "Conversation deleted" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

export {
  createConversation,
  getConversationsByUser,
  createMessage,
  getMessages,
  deleteConversation,
};

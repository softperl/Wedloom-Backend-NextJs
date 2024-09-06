import { Request, Response } from "express";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import prisma from "@/src/lib/prisma";
import { io } from "..";
import { send } from "process";

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
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    if (extConversation) {
      return res.status(StatusCodes.OK).json({ conversation: extConversation });
    } else {
      const newConversation = await prisma.conversation.create({
        data: {
          key: `${userId}${receiverId}`,
          authorId: userId,
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
          users: {
            include: {
              user: true,
            },
          },
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
    const favConversations = await prisma.favConversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            users: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const conversations = await prisma.conversation.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
        NOT: {
          id: {
            in: favConversations.map((fav) => fav.conversationId),
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        users: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const fConvs = favConversations.map((fav) => fav.conversation);
    res
      .status(StatusCodes.OK)
      .json({ conversations: conversations, favConversations: fConvs });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

// Function to get messages for a specific conversation
const getMessages = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const userId = res.locals.user.id;
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    await prisma.message.updateMany({
      where: {
        conversationId,
        seen: false,
        NOT: [{ senderId: userId }],
      },
      data: {
        seen: true,
      },
    });
    res.status(StatusCodes.OK).json({ messages });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const createMessage = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { text, conversationId } = req.body;
  if (!conversationId || !text) {
    return;
  }
  try {
    const { conversationId, text } = req.body;

    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        text,
      },
      include: {
        conversation: {
          select: {
            users: true,
          },
        },
      },
    });

    const receiverId = newMessage.conversation.users.find(
      (user) => user.userId !== userId
    )?.userId;

    io.emit(`new-message-${conversationId}-${receiverId}`, {
      message: newMessage,
    });
    io.emit(`new-message-${receiverId}`, {
      message: newMessage,
    });

    res.status(StatusCodes.OK).json({ message: newMessage });
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

const getChatUsersByConversationId = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { conversationId } = req.params;
  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new BadRequestError("Conversation not found");
    }

    const users = conversation.users
      .map((user) => user.user)
      .filter((user) => user.id !== userId)[0];
    res.status(StatusCodes.OK).json(users);
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const addToFav = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { conversationId } = req.params;
  try {
    const fav = await prisma.favConversation.create({
      data: {
        userId,
        conversationId,
      },
    });
    res.status(StatusCodes.OK).json({ fav });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const removeFromFav = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { conversationId } = req.params;
  try {
    const fav = await prisma.favConversation.deleteMany({
      where: {
        userId,
        conversationId,
      },
    });
    res.status(StatusCodes.OK).json({ fav });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const isFavoriteConversation = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { conversationId } = req.params;
  try {
    const favConversation = await prisma.favConversation.findMany({
      where: {
        userId,
        conversationId,
      },
    });

    const isFavorite = !!favConversation[0];
    res.status(StatusCodes.OK).json(isFavorite);
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getUnreadConversation = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  try {
    const unreadCount = await prisma.conversation.count({
      where: {
        users: {
          some: {
            userId,
          },
        },
        messages: {
          some: {
            seen: false,
            senderId: {
              not: userId,
            },
          },
        },
      },
    });
    res.status(StatusCodes.OK).json(unreadCount);
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const markAsUnread = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { conversationId } = req.params;
  try {
    const lastMessage = await prisma.message.findFirst({
      where: {
        conversationId,
        seen: true,
        senderId: {
          not: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (lastMessage) {
      await prisma.message.update({
        where: {
          id: lastMessage.id,
        },
        data: {
          seen: false,
        },
      });
    }

    res.status(StatusCodes.OK).json({ msg: "Marked as unread" });
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
  addToFav,
  removeFromFav,
  getChatUsersByConversationId,
  isFavoriteConversation,
  getUnreadConversation,
  markAsUnread,
};

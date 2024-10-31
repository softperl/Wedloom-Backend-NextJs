import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { mailQueue } from "../jobs/queue";
import { newCategorySchema, newPostSchema } from "../schema/post.schema";
import { getAllSchema } from "./adminAuthController";
import { generateUniqueSlug } from "../utils/general.utils";
import { nanoid } from "nanoid";

const newPost = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const data = req.body;

  const tags = Array.isArray(data.tags) ? data.tags : [];

  try {
    const slug = nanoid();
    await prisma.post.upsert({
      where: {
        id: data.id || "0",
      },
      create: {
        userId,
        title: data.title,
        categoryId: data.categoryId,
        description: data.description,
        keywords: data?.keywords,
        tags,
        status: data.status,
        authorId: data.authorId,
        isFeatured: data.isFeatured,
        allowComments: data.allowComments,
        thumbnail: data.thumbnail,
        content: data.content,
        slug,
      },
      update: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.description && { description: data.description }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.status && { status: data.status }),
        ...(data.thumbnail && { thumbnail: data.thumbnail }),
        ...(data.keywords && { keywords: data.keywords }),
        ...(tags && { tags }),
        ...(data.categoryId && { categoryId: data.categoryId }),
      },
    });
    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const deletePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  try {
    await prisma.post.delete({
      where: {
        id: postId,
      },
    });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    let { q, page, perPage, sortBy, sortOrder } = getAllSchema.parse(req.query);
    const offset = (parseInt(`${page}`) - 1) * parseInt(`${perPage}`);
    let whereCondition = {};
    if (q) {
      whereCondition = {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      };
    }
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: {
          ...whereCondition,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },

        skip: offset,
        take: parseInt(`${perPage}`),
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.post.count({
        where: {
          ...whereCondition,
        },
      }),
    ]);
    const totalPages = Math.ceil(totalCount / parseInt(`${perPage}`));
    res.status(StatusCodes.OK).json({
      posts: posts,
      total: totalCount,
      totalPages,
    });
    res.status(StatusCodes.OK).json({ posts });
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};

const getPostBySlug = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  try {
    const post = await prisma.post.findUnique({
      where: {
        slug: id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    console.log(post);
    res.status(StatusCodes.OK).json({ post });
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};

const newCategory = async (req: Request, res: Response) => {
  try {
    const { name, parentId, photo } = newCategorySchema.parse(req.body);
    const slug = await generateUniqueSlug(name, "category");
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        photo,
        parentId: parentId || null,
      },
    });
    res.status(StatusCodes.CREATED).json({ category });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(StatusCodes.OK).json({ categories });
  } catch (error) {
    console.log(error);

    throw new BadRequestError("Something went wrong");
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  try {
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });
    res.status(StatusCodes.OK).json({});
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};

const newAuthor = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    await prisma.author.create({
      data: {
        name,
        slug,
      },
    });
    res.status(StatusCodes.CREATED).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getAllAuthor = async (req: Request, res: Response) => {
  try {
    const authors = await prisma.author.findMany();
    res.status(StatusCodes.OK).json({ authors });
  } catch (error) {
    console.log(error);

    throw new BadRequestError("Something went wrong");
  }
};

const deleteAuthor = async (req: Request, res: Response) => {
  const { authorId } = req.params;
  try {
    await prisma.category.delete({
      where: {
        id: authorId,
      },
    });
    res.status(StatusCodes.OK).json({});
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};

const newEmailAlert = async (req: Request, res: Response) => {
  const { email } = req.params;
  try {
    await prisma.emailAlert.create({
      data: {
        email,
      },
    });
    res.status(StatusCodes.OK).json({});
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};

export {
  newPost,
  deletePost,
  getAllPosts,
  newCategory,
  getAllCategories,
  deleteCategory,
  newAuthor,
  getAllAuthor,
  deleteAuthor,
  getPostBySlug,
  newEmailAlert,
};

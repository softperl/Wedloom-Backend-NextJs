import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { mailQueue } from "../jobs/queue";
import { newCategorySchema, newPostSchema } from "../schema/post.schema";
import { getAllSchema } from "./adminAuthController";
import { generateUniqueSlug } from "../utils/general.utils";

const newPost = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  try {
    const data = newPostSchema.parse(req.body);
    const slug = await generateUniqueSlug(data.title, "post");
    const post = await prisma.post.upsert({
      where: {
        id: data.id || "0",
      },
      create: {
        title: data.title,
        slug,
        content: data.content,
        description: data.description,
        isFeatured: data.isFeatured,
        status: data.status,
        userId,
        thumbnail: data.thumbnail,
        keywords: data.keywords,
        allowComments: data.allowComments,
        tags: data.tags,
        categoryId: data.categoryId,
      },
      update: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.description && { description: data.description }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.status && { status: data.status }),
        ...(data.thumbnail && { thumbnail: data.thumbnail }),
        ...(data.keywords && { keywords: data.keywords }),
        ...(data.allowComments !== undefined && {
          allowComments: data.allowComments,
        }),
        ...(data.tags && { tags: data.tags }),
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

const newCategory = async (req: Request, res: Response) => {
  try {
    const { name, parentId } = newCategorySchema.parse(req.body);
    const slug = await generateUniqueSlug(name, "category");
    const category = await prisma.category.create({
      data: {
        name,
        slug,
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

export {
  newPost,
  deletePost,
  getAllPosts,
  newCategory,
  getAllCategories,
  deleteCategory,
};

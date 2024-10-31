import { z } from "zod";

const newPostSchema = z.object({
  id: z.string().max(64).optional(),
  slug: z.string().max(128),
  title: z.string().max(128),
  description: z.string().max(512),
  content: z.string().max(10000),
  thumbnail: z.string().max(256).optional(),
  keywords: z.any().optional(),
  tags: z.any().optional(),
  status: z.enum(["Published", "Draft"]).default("Published"),
  categoryId: z.string().max(64),
  authorId: z.string().max(64),
  isFeatured: z.boolean().default(false),
  allowComments: z.boolean().default(false),
});

const newCategorySchema = z.object({
  name: z.string().max(128),
  parentId: z.string().max(64).optional(),
});

export { newPostSchema, newCategorySchema };

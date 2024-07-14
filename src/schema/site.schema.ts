import { z } from "zod";

const newLegalSchema = z.object({
  id: z.number().max(64).optional(),
  title: z.string().max(128),
  content: z.string().max(10000),
  status: z.enum(["Published", "Draft"]).default("Published"),
});

const aboutSchema = z.object({
  id: z.number().max(64).optional(),
  name: z.string().max(256),
  email: z.string().email().max(128),
  phone: z.string().max(128),
  seoTitle: z.string().max(256),
  content: z.string().max(10000),
  tagLine: z.string().max(128),
  seoKeyWords: z.any().optional(),
  description: z.string().max(10000),
});

export { newLegalSchema, aboutSchema };

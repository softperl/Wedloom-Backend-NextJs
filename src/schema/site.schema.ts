import { z } from "zod";

const newLegalSchema = z.object({
  id: z.number().max(64).optional(),
  title: z.string().max(128),
  content: z.string().max(10000),
  status: z.enum(["Published", "Draft"]).default("Published"),
});

export { newLegalSchema };

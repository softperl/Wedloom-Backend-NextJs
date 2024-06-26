import { z } from "zod";

const loginSchema = z.object({
  email: z.string().max(64),
  password: z.string().max(64),
});

const registerSchema = z
  .object({
    name: z.string().max(64),
    email: z.string().email().max(64),
    phone: z.string().max(64).optional(),
    password: z.string().max(64),
    brand: z.string().max(64).optional(),
    city: z.string().max(64).optional(),
    vendorType: z.string().max(64).optional(),
    role: z.enum(["User", "Vendor"]).default("User"),
  })
  .refine(
    (data) => {
      if (data.role == "Vendor") {
        if (!data.phone || !data.city || !data.brand || !data.vendorType) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Invalid data!",
      path: ["phone", "city", "brand", "vendorType"],
    }
  );

export { registerSchema, loginSchema };

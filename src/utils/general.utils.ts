import { BadRequestError } from "../errors";
import prisma from "@/src/lib/prisma";

function generateSlug(str: string) {
  if (!str) {
    throw new BadRequestError("Input string is empty");
  }
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateUniqueSlug(
  str: string,
  table: "post" | "category",
  count = 0
) {
  const slug =
    count === 0 ? generateSlug(str) : `${generateSlug(str)}-${count}`;
  try {
    //@ts-ignore
    const value = await prisma[table].findUnique({
      where: { slug },
      select: { id: true },
    });
    if (value) {
      return generateUniqueSlug(str, table, count + 1);
    }
    return slug;
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Error generating unique slug");
  }
}

export const getFileExt = (fname: string) => {
  return fname.slice(((fname.lastIndexOf(".") - 1) >>> 0) + 2);
};

// Calculate average review score
export const averageReview = (reviews: any) => {
  const totalScore = reviews.reduce(
    (acc: any, review: any) => acc + review.rating,
    0
  );
  const average = reviews.length
    ? Math.round((totalScore / reviews.length) * 2) / 2
    : 0;
  return average;
};

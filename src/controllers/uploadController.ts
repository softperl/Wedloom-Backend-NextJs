import { Request, Response } from "express";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import sharp from "sharp";
import { putObject } from "../lib/s3";
import { getFileExt } from "../utils/general.utils";
import { z } from "zod";

const uploadSchema = z.object({
  dir: z
    .enum(["profile", "others", "resume", "logo"])
    .optional()
    .default("others"),
});

const getKey = (
  dir: "profile" | "others" | "resume" | "logo",
  fileExt: string,
  isImage: boolean = false
) => {
  switch (dir) {
    case "profile":
      return "profile.png";
    case "others":
      return isImage
        ? `others/${Date.now()}.png`
        : `others/${Date.now()}.${fileExt}`;
    case "resume":
      return isImage
        ? `resume/${Date.now()}.png`
        : `resume/${Date.now()}.${fileExt}`;
    case "logo":
      return `logos/logo_${Date.now()}.png`;
    default:
      return `others/${Date.now()}.${fileExt}`;
  }
};

const uploadFile = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { dir } = uploadSchema.parse(req.body);

  let files: any = req?.files?.["files"] || null;
  if (!files) throw new BadRequestError("No file found!");
  if (!Array.isArray(files)) {
    files = [files];
  }
  const MAX_FILES = 1;
  const MAX_SIZE = dir == "resume" ? 1024 * 1024 * 2 : 1024 * 1024 * 1;
  const allowedExt = [
    "pdf",
    "doc",
    "docx",
    "txt",
    "png",
    "jpg",
    "jpeg",
    "webp",
  ];
  if (files.length > MAX_FILES) {
    throw new BadRequestError("Too many files to upload!");
  }

  const promises: Promise<void>[] = [];
  const uploadedFiles: string[] = [];

  for (const file of files) {
    if (!file || file.size > MAX_SIZE) {
      throw new BadRequestError("File too big to upload!");
    }

    if (!allowedExt.includes(getFileExt(file.name).toLowerCase())) {
      throw new BadRequestError(
        "Invalid file type! Only supports pdf, docx, txt, png, jpg, jpeg, webp"
      );
    }

    if (dir == "profile" || dir == "logo") {
      if (!file.mimetype.startsWith("image/")) {
        throw new BadRequestError("Profile picture must be an image!");
      }
    }

    let resizedImage: Buffer | null = null;
    if (file.mimetype.startsWith("image/")) {
      const image = sharp(file.data);
      resizedImage = await image
        .resize({ width: 512, withoutEnlargement: true })
        .toFormat("png", {
          quality: 80,
        })
        .toBuffer();
    }
    console.log(file);

    const fileContent = Buffer.from(resizedImage || file.data, "base64");
    const key = getKey(
      dir,
      getFileExt(file.name),
      file.mimetype.startsWith("image/")
    );
    const filePath = `${userId}/${key}`;

    promises.push(putObject(filePath, fileContent, file.mimetype));
    uploadedFiles.push(`${process.env.S3_ENDPOINT!}/${filePath}`);
  }

  await Promise.all(promises);
  res.status(StatusCodes.OK).json({ files: uploadedFiles });
};

export { uploadFile };

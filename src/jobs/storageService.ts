import { sendMail } from "../lib/mail";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import { deleteObject } from "../lib/s3";

const addToStorageQueue = (operationType: string) => {
  switch (operationType) {
    case "DELETE-OBJECT":
      return deleteObjectFn;
    default:
      throw new Error("Invalid operation type");
  }
};

async function deleteObjectFn(data: any) {
  try {
    await deleteObject(data.key);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export { addToStorageQueue };

import { sendMail } from "../lib/mail";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";

const addToDBQueue = (operationType: string) => {
  switch (operationType) {
    case "TEST":
      return test;
    default:
      throw new Error("Invalid operation type");
  }
};

async function test(data: any) {}

export { addToDBQueue };

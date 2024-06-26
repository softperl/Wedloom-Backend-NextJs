import { sendMail } from "../lib/mail";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";

const addToMailQueue = (emailType: string) => {
  switch (emailType) {
    case "NEW-ACCOUNT-CREATED":
      return sendVerificationMail;
    default:
      throw new Error("Invalid email type");
  }
};

async function sendVerificationMail(data: any) {
  try {
    const { name, email } = data;
    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });
    const verifyTemplateLink = fs.readFileSync(
      path.join(__dirname, "/hbs/verify.hbs"),
      "utf8"
    );
    const template = handlebars.compile(verifyTemplateLink);
    const vers = {
      name: `${name}`,
      activationLink: `${process.env.CLIENT_URL}/verify/${token}`,
    };
    const result = template(vers);
    await sendMail({
      from: "verify@bayah.app",
      fromName: "Soft Perl",
      to: "email",
      subject: "Please verify your email",
      html: result,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export { addToMailQueue };

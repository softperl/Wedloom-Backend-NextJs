import { get } from "lodash";
import prisma from "@/src/lib/prisma";
import { verifyJwt, signJwt } from "../utils/jwt.utils";

export async function createSession(userId: string, userAgent: string) {
  const session = await prisma.session.create({
    data: {
      userId,
      userAgent,
    },
  });

  return session;
}

export async function reIssueAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const { decoded } = verifyJwt(refreshToken, "REFRESH_TOKEN_PUBLIC_KEY");

  if (!decoded || !get(decoded, "session")) return false;

  const session = await prisma.session.findUnique({
    where: {
      id: get(decoded, "session"),
    },
  });

  if (!session || !session.valid) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) return false;

  const accessToken = signJwt(
    { ...user, session: session.id },
    "ACCESS_TOKEN_PRIVATE_KEY",
    { expiresIn: process.env.ACCESS_TOKEN_TTL } // 15 minutes
  );

  return accessToken;
}

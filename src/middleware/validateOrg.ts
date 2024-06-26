import { Response, NextFunction } from "express";
import { UnAuthenticatedError, BadRequestError } from "../errors";
import prisma from "../lib/prisma";
import { redis } from "../lib/redis";

const validateOrg = async (req: any, res: Response, next: NextFunction) => {
  const orgId =
    req.body?.orgId ||
    req.params?.orgId ||
    req.query?.orgId ||
    req.body?.organizationId ||
    req.params?.organizationId ||
    req.query?.organizationId;
  const { id } = req.user;
  if (!orgId || !id) {
    throw new UnAuthenticatedError("Access denied!");
  }
  let org = null;
  const cachedValue = await redis.get(`org::${orgId}::${id}`);
  if (cachedValue) {
    org = JSON.parse(cachedValue);
  } else {
    // org = await prisma.organization.findFirst({
    //   where: {
    //     id: orgId,
    //     userId: id,
    //   },
    // });
  }
  if (!org) {
    throw new BadRequestError("Organization not found");
  }
  req.org = org;
  await redis.set(
    `org::${orgId}::${id}`,
    JSON.stringify(org),
    "EX",
    60 * 60 * 24 * 30
  );
  next();
};

export default validateOrg;

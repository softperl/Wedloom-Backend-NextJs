import jwt from "jsonwebtoken";

export function signJwt(
  object: Object,
  keyName: "ACCESS_TOKEN_PRIVATE_KEY" | "REFRESH_TOKEN_PRIVATE_KEY",
  options?: jwt.SignOptions | undefined
) {
  const signingKey = Buffer.from(`${process.env[keyName]}`, "base64").toString(
    "ascii"
  );

  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: "RS256",
    allowInsecureKeySizes: true,
  });
}

export function verifyJwt(
  token: string,
  keyName: "ACCESS_TOKEN_PUBLIC_KEY" | "REFRESH_TOKEN_PUBLIC_KEY"
) {
  const publicKey = Buffer.from(`${process.env[keyName]}`, "base64").toString(
    "ascii"
  );

  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    console.error(e);
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
}

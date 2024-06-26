import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "us-west-1",
  bucketEndpoint: true,
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const putObject = async (key: string, content: any, type: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_ENDPOINT!,
    Key: key,
    ACL: "public-read",
    Body: content,
    ContentType: type,
  });
  await s3.send(command);
};

const deleteObject = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_ENDPOINT!,
    Key: key,
  });
  await s3.send(command);
};

export { s3, putObject, deleteObject };

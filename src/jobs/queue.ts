import { Queue } from "bullmq";
import { redis } from "../lib/redis";

const mailQueue = new Queue("mail-sender", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 3600,
    },
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

const storageQueue = new Queue("storage-operation", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 3600,
    },
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

const dbQueue = new Queue("db-operation", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 3600,
    },
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
export { mailQueue, dbQueue, storageQueue };

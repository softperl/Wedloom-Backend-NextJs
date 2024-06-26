import { Worker } from "bullmq";
import { redis } from "../lib/redis";
import {
  DBOperationTypes,
  EmailTypes,
  StorageOperationTypes,
} from "./jobTypes";
import { addToMailQueue } from "./mailService";
import { nanoid } from "nanoid";
import { addToDBQueue } from "./dbService";
import { addToStorageQueue } from "./storageService";

interface Workers {
  init: () => void;
}

const workers: Workers = {
  init: () => {
    mailWorker.run();
    dbWorker.run();
    storageWorker.run();
  },
};
const mailWorker = new Worker(
  "mail-sender",
  async (job) => {
    try {
      const data = job.data;
      const emailType = data.queueType;
      if (!EmailTypes.includes(emailType)) {
        throw new Error(`Invalid email type ${emailType} for job ${job.id}`);
      }

      const mailFunction = addToMailQueue(emailType);
      await mailFunction(data);
    } catch (error: any) {
      console.log(error.message);

      await job.moveToFailed(new Error(error.message), `${nanoid()}`, false);
    }
  },
  {
    connection: redis,
    autorun: false,
    lockDuration: 30000,
    // concurrency:5
  }
)
  .on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
  })
  .on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed with error: ${error.message}`);
  });

const dbWorker = new Worker(
  "db-operation",
  async (job) => {
    try {
      const data = job.data;
      const dbOperationType = data.queueType;

      if (!DBOperationTypes.includes(dbOperationType)) {
        throw new Error(
          `Invalid db operation type ${dbOperationType} for job ${job.id}`
        );
      }

      const dbFunction = addToDBQueue(dbOperationType);
      await dbFunction(data);
    } catch (error: any) {
      console.log(error.message);

      await job.moveToFailed(new Error(error.message), `${nanoid()}`, false);
    }
  },
  {
    connection: redis,
    autorun: false,
    lockDuration: 30000,
    // concurrency:5
  }
)
  .on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
  })
  .on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed with error: ${error.message}`);
  });

const storageWorker = new Worker(
  "storage-operation",
  async (job) => {
    try {
      const data = job.data;
      const type = data.queueType;

      if (!StorageOperationTypes.includes(type)) {
        throw new Error(`Invalid db operation type ${type} for job ${job.id}`);
      }

      const storageFunction = addToStorageQueue(type);
      await storageFunction(data);
    } catch (error: any) {
      console.log(error.message);
      await job.moveToFailed(new Error(error.message), `${nanoid()}`, false);
    }
  },
  {
    connection: redis,
    autorun: false,
    lockDuration: 30000,
    // concurrency:5
  }
)
  .on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
  })
  .on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed with error: ${error.message}`);
  });
export { workers };

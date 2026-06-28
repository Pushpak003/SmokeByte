import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const conversionQueue = new Queue("conversionQueue", {
  connection: redisConnection,
});

export const addToQueue = async (jobData) => {
  return await conversionQueue.add("convert-file", jobData, {
    attempts: 1,          // No retries — temp file is deleted after first attempt
    removeOnComplete: true,
    removeOnFail: false,
  });
};
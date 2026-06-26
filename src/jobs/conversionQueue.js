import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const conversionQueue = new Queue("conversionQueue", {
  connection: redisConnection,
});

export const addToQueue = async (jobData) => {
  return await conversionQueue.add("convert-file", jobData, {
    attempts: 3,
    backoff: { type: "fixed", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  });
};
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const conversionQueue = new Queue("conversionQueue", {
  connection: redisConnection,
});

export const addToQueue = async (jobData) => {
  return await conversionQueue.add("convert-file", jobData, {
    attempts: 3,              // 3 retries — race condition ke baad bhi worker retry karega
    backoff: {
      type: "exponential",
      delay: 2000,            // 2s, 4s, 8s
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
};
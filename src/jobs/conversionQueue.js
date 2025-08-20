import {Queue} from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

export const conversionQueue = new Queue("conversionQueue", {connection});

export const addToQueue = async(jobData) =>{
    return await conversionQueue.add("convert-file",jobData, {
        attempts:3,
        backoff: {type: "fixed", delay:2000},
        removeOnComplete:true,
        removeOnFail:false
    });
};
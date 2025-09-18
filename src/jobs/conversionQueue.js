import {Queue} from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL, {
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
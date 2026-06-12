import { createClient } from "redis";

export const redisClient = createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
});

redisClient.on("connect", () => {
    console.log("Connecting to Redis.");
});

redisClient.on("ready", () => {
    console.log("Connected to Redis.");
});

redisClient.on("error", (error) => {
    console.error("Redis error:", error);
});

redisClient.on("end", () => {
    console.log("Redis connection closed.");
});

export default async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    return redisClient;
}

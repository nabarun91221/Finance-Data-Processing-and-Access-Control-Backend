import { createClient } from "redis";
// const REDIS_PASSWORD = process.env.REDIS_CLOUD_PASSWORD

let redisClient
if (process.env.NODE_ENV !== "test") {
    const REDIS_URI = process.env.REDIS_CLOUD_URI
    redisClient = await createClient({
        url: REDIS_URI,
    }).on("error", (err) => console.log("Redis Client Error", err)).connect().then(
        console.log("Redis Connected...")
    )
}

export default redisClient;


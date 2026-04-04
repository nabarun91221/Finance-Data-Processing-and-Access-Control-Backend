import { createClient } from "redis";
// const REDIS_PASSWORD = process.env.REDIS_CLOUD_PASSWORD

let redisClient
if (process.env.NODE_ENV !== "test") {
    const REDIS_URI = process.env.REDIS_CLOUD_URI || process.env.REDIS_DOCKER_URI
    const REDIS_PASSWORD = process.env.REDIS_CLOUD_PASSWORD || process.env.REDIS_DOCKER_PASSWORD
    if (!REDIS_URI && !REDIS_PASSWORD) {
        console.log("Redis is not configure properly. got => ", `redis url: ${REDIS_URI} & redis password: ${REDIS_PASSWORD}`)
        process.exit(1);
    }
    redisClient = await createClient({
        url: REDIS_URI,
        password: REDIS_PASSWORD
    }).on("error", (err) => console.log("Redis Client Error", err)).connect().then(
        console.log("Redis Connected...")
    )
}

export default redisClient;


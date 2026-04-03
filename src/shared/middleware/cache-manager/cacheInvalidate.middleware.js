import redisClient from "../../../configs/redis.config.js";
const invalidateCache = async (pattern) =>
{
    if (process.env.NODE_ENV === "test") {
        return;
    }

    const keys = [];

    for await (const batch of redisClient.scanIterator({
        MATCH: pattern
    })) {

        for (const key of batch) {
            keys.push(key);
        }

    }

    if (!keys.length) {
        console.log("no keys to invalidate");
        return;
    }

    console.log("invalidating cache:", keys);

    await redisClient.del(...keys);

};
export default invalidateCache;
import redisClient from "../../../configs/redis.config.js";
const cacheRead = (prefix = "cache") =>
{
    if (process.env.NODE_ENV === "test") {
        return;
    }

    return async (req, res, next) =>
    {

        console.log("cache middleware triggered");

        if (req.method !== "GET") {
            return next();
        }

        try {

            const key = `${prefix}:${req.originalUrl}`;
            console.log("cache key:", key);

            const cached = await redisClient.get(key);

            if (cached) {
                console.log("cache hit:", cached);
                return res.status(200).json(JSON.parse(cached));
            }

            console.log("cache miss");

            res.locals.cacheKey = key;

            next();

        } catch (err) {
            console.error("cache error", err);
            next(err);
        }

    };
};
export default cacheRead
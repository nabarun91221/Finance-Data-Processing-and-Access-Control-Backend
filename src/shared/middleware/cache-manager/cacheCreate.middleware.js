import redisClient from "../../../configs/redis.config.js";

const cacheCreate = (ttl = 60) =>
{

    if (process.env.NODE_ENV === "test") {
        return;
    }
    return async (req, res, next) =>
    {
        console.log("cache create middleware triggered");
        console.log(res.locals.responseData);

        try {

            const payload = res.locals.responseData;

            if (!payload) {
                return next();
            }

            const key = res.locals.cacheKey;

            if (key && req.method === "GET") {

                await redisClient.setEx(
                    key,
                    ttl,
                    JSON.stringify(payload)
                );

            }

            // return res.status(200).json(payload);
            next();

        } catch (err) {
            next(err);
        }

    };
};
export default cacheCreate;
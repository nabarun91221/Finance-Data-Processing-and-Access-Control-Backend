import rateLimit from "express-rate-limit";

const rateLimiterFn = (ms = 5 * 60 * 1000, maxRequest = 100) =>
{
    return rateLimit({
        windowMs: ms,
        max: maxRequest,
        message: {
            success: false,
            message: "Too many requests, please try again later"
        },
        standardHeaders: true,
        legacyHeaders: false
    });
}

export default rateLimiterFn;
import "dotenv/config";

import express from "express";
import connectMongoDb from "./configs/mongoDb.config.js";
import "./configs/redis.config.js"

import cors from "cors"
import cookieParser from "cookie-parser"
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./configs/swagger.config.js";


import verifyRequestJwt from "./shared/middleware/auth.middleware.js";
import globalErrorHandler from "./shared/middleware/response-handler/error.middleware.js";
import globalResponseHandler from "./shared/middleware/response-handler/response.middleware.js";
import cacheCreate from "./shared/middleware/cache-manager/cacheCreate.middleware.js";
import auditLogger from "./modules/audit-logs/auditLogger.middleware.js";


import AuthRouter from './modules/auth/routes/auth.route.js';
import UserRouter from './modules/users/routes/user.route.js';
import AnalyticsRouter from './modules/analytics/analytics.route.js';
import BudgetRouter from "../src/modules/budgets/routes/budget.route.js";
import CategoryRouter from "../src/modules/financial-record-categories/routes/category.route.js";
import FinancialRecordRouter from "../src/modules/financial-records/routes/financialRecord.route.js";
import AuditLogRouter from "./modules/audit-logs/routes/auditLogs.route.js"
import rateLimiterFn from "./shared/middleware/ratelimiter.middleware.js";

const App = express();
const BaseUrl = "/api"

const PORT = process.env.PORT;
const environment = process.env.ENVIRONMENT;
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS)
const rateLimitMaxReq = Number(process.env.RATE_LIMIT_MAX_REQUESTS)
const ratelimiter = rateLimiterFn(rateLimitWindowMs, rateLimitMaxReq);
const cacheTtl = Number(process.env.CACHE_TTL_MS)
const clientUrl = process.env.CLIENT_BASE_URL
const vpsIp = process.env.VPS_IP

//config
App.use(express.urlencoded());
App.use(express.json());


App.use(
    cors({
        origin: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
    })
);
App.use(cookieParser());


//rate limiter
App.use(BaseUrl, ratelimiter)

//routes
App.use(BaseUrl, AuthRouter);
App.use(BaseUrl, verifyRequestJwt, UserRouter);
App.use(BaseUrl, verifyRequestJwt, AnalyticsRouter);
App.use(BaseUrl, verifyRequestJwt, BudgetRouter);
App.use(BaseUrl, verifyRequestJwt, CategoryRouter);
App.use(BaseUrl, verifyRequestJwt, FinancialRecordRouter);
App.use(BaseUrl, verifyRequestJwt, AuditLogRouter);

//swagger
App.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            withCredentials: true
        }
    })
);

//create audit log of interactions with the system
App.use(auditLogger)

//cache (60*10 sec = 10min)
App.use(cacheCreate(cacheTtl));

//global response and error handling
App.use(globalResponseHandler)
App.use(globalErrorHandler)



App.listen(PORT, async (err) =>
{
    if (!err) {
        await connectMongoDb();
        if (environment != "PRODUCTION") {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Find swagger api documentation at http://localhost:${PORT}/api-docs`)
        }
        else {
            console.log(`Server running at ${vpsIp}:${PORT}`);
            console.log(`Find swagger api documentation at ${vpsIp}:${PORT}/api-docs`)
        }
    }
})
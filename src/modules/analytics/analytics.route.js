import { Router } from "express";
import analyticsController from "./controllers/analytics.controller.js";
import cacheRead from "../../shared/middleware/cache-manager/cacheRead.middleware.js";
import scopeValidation from "../../shared/middleware/scope.validation.middleware.js";


const router = Router();
const baseUrl = "/analytics"


router.get(`${baseUrl}/summary`, scopeValidation("read:analytics"), cacheRead("analytics"), analyticsController.getFinancialSummary);
router.get(`${baseUrl}/category`, scopeValidation("read:analytics"), cacheRead("analytics"), analyticsController.getCategoryTotals);
router.get(`${baseUrl}/mtrend`, scopeValidation("read:analytics"), cacheRead("analytics"), analyticsController.getMonthlyTrend);
router.get(`${baseUrl}/activity`, scopeValidation("read:analytics"), cacheRead("analytics"), analyticsController.getRecentActivity);

export default router;

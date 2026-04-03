import { Router } from "express";
import auditLoggerController from "../controllers/auditLogger.controller.js";
import cacheRead from "../../../shared/middleware/cache-manager/cacheRead.middleware.js";
import scopeValidation from "../../../shared/middleware/scope.validation.middleware.js";
const router = Router();
const baseUrl = "/audit-logs"
router.get(baseUrl, scopeValidation("read:audit-logs"), cacheRead("audit-logs"), auditLoggerController.getAuditLogs);

export default router;
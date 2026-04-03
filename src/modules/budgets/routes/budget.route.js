import { Router } from "express";
import budgetController from "../controllers/budget.controller.js";
import validateDto from "../../../shared/middleware/dto.validation.middleware.js";
import createBudgetDTO from "../dtos/createBudget.dto.js";
import updateBudgetDTO from "../dtos/updateBudget.dto.js";
import cacheRead from "../../../shared/middleware/cache-manager/cacheRead.middleware.js";
import scopeValidation from "../../../shared/middleware/scope.validation.middleware.js";

const router = Router();
const baseUrl = "/budgets"


router.post(baseUrl, scopeValidation("write:budgets"), validateDto(createBudgetDTO), budgetController.createBudget);

router.get(baseUrl, scopeValidation("read:budgets"), cacheRead("budgets"), budgetController.getAllBudgets);

router.get(`${baseUrl}/:id`, scopeValidation("read:budgets"), cacheRead("budgets"), budgetController.getBudgetById);

router.patch(`${baseUrl}/:id`, scopeValidation("update:budgets"), validateDto(updateBudgetDTO), budgetController.updateBudget);

router.delete(`${baseUrl}/:id`, scopeValidation("delete:budgets"), budgetController.deleteBudget);

export default router;
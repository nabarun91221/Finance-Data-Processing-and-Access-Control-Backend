
import { Router } from "express";
import createFinancialRecordDTO from "../dtos/createFinancialRecord.dto.js";
import updateFinancialRecordDTO from "../dtos/updateFinancialRecord.dto.js";
import validateDto from "../../../shared/middleware/dto.validation.middleware.js";
import financialRecordController from "../controllers/financialRecord.controller.js";
import cacheRead from "../../../shared/middleware/cache-manager/cacheRead.middleware.js";
import scopeValidation from "../../../shared/middleware/scope.validation.middleware.js";

const router = Router();

router.post(
    "/records",
    scopeValidation("write:financial-records"),
    validateDto(createFinancialRecordDTO),
    financialRecordController.createRecord
);

router.get(
    "/records",
    scopeValidation("read:financial-records"),
    cacheRead("records"),
    financialRecordController.getAllRecords
);

router.get(
    "/records/:id",
    scopeValidation("read:financial-records"),
    cacheRead("records"),
    financialRecordController.getRecordById
);

router.patch(
    "/records/:id",
    scopeValidation("update:financial-records"),
    validateDto(updateFinancialRecordDTO),
    financialRecordController.updateRecord
);

router.delete(
    "/records/:id",
    scopeValidation("delete:financial-records"),
    financialRecordController.deleteRecord
);

export default router;
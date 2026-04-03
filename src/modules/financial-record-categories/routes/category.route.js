import { Router } from "express";
import categoryController from "../controllers/category.controller.js";
import validateDto from "../../../shared/middleware/dto.validation.middleware.js";
import createCategoryDTO from "../dtos/createCategory.dto.js";
import updateCategoryDTO from "../dtos/updateCategory.dto.js";
import cacheRead from "../../../shared/middleware/cache-manager/cacheRead.middleware.js";
import scopeValidation from "../../../shared/middleware/scope.validation.middleware.js";
const router = Router();

router.post(
    "/categories",
    scopeValidation("write:financial-records-categories"),
    validateDto(createCategoryDTO),
    categoryController.createCategory
);

router.get(
    "/categories",
    scopeValidation("read:financial-records-categories"),
    cacheRead("categories"),
    categoryController.getAllCategories
);

router.get(
    "/categories/:id",
    scopeValidation("read:financial-records-categories"),
    cacheRead("categories"),
    categoryController.getCategoryById
);

router.patch(
    "/categories/:id",
    scopeValidation("update:financial-records-categories"),
    validateDto(updateCategoryDTO),
    categoryController.updateCategory
);

router.delete(
    "/categories/:id",
    scopeValidation("delete:financial-records-categories"),
    categoryController.deleteCategory
);

export default router;
import { Router } from "express";
import createUserDTO from "../dtos/createUser.dto.js";
import updateUserDTO from "../dtos/updateUser.dto.js";
import validateDto from "../../../shared/middleware/dto.validation.middleware.js";
import userController from "../controllers/user.controller.js";
import cacheRead from "../../../shared/middleware/cache-manager/cacheRead.middleware.js";
import scopeValidation from "../../../shared/middleware/scope.validation.middleware.js";
const router = Router();

router.post(
    "/users",
    scopeValidation("write:users"),
    validateDto(createUserDTO),
    userController.createUser
);

router.get(
    "/users",
    scopeValidation("read:users"),
    cacheRead("users"),
    userController.getAllUsers
);

router.get(
    "/users/:id",
    scopeValidation("read:users"),
    cacheRead("users"),
    userController.getUserById
);

router.patch(
    "/users/:id",
    scopeValidation("update:users"),
    validateDto(updateUserDTO),
    userController.updateUser
);

router.delete(
    "/users/:id",
    scopeValidation("delete:users"),
    userController.deleteUser
);

export default router;
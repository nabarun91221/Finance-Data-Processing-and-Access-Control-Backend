import { Router } from "express";
import AuthController from "../controllers/auth.controller.js"
import validateDto from "../../../shared/middleware/dto.validation.middleware.js";
import registerDto from "../dtos/register.dto.js";
import loginDto from "../dtos/login.dto.js"
const router = Router();


router.post("/auth/register", validateDto(registerDto), AuthController.registerUser);
router.post("/auth/login", validateDto(loginDto), AuthController.logIn);
router.post("/auth/logout", AuthController.logout);
router.get("/auth/verify/:token", AuthController.verifyEmail);


export default router;
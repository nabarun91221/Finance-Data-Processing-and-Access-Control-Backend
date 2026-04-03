import Joi from "joi";
import { ROLES } from "../../../shared/utils/roles.js";
const updateUserDTO = Joi.object({

    name: Joi.string()
        .trim()
        .min(2)
        .max(100),

    email: Joi.string()
        .email(),

    password: Joi.string()
        .min(6)
        .max(50),

    role: Joi.string()
        .valid(...ROLES),

    isActive: Joi.boolean()

}).min(1);

export default updateUserDTO;
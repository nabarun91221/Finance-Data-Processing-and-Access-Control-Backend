import Joi from "joi";
import { ROLES } from "../../../shared/utils/roles.js";
const createUserDTO = Joi.object({

    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(6)
        .max(50)
        .optional,

    role: Joi.string()
        .valid(...ROLES)
        .optional(),

    isActive: Joi.boolean()
        .optional()

});

export default createUserDTO;
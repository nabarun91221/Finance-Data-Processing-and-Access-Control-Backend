import Joi from "joi";

const createCategoryDTO = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),

    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9-]+$/)
        .required(),

    type: Joi.string()
        .valid("INCOME", "EXPENSE")
        .required(),

    parentCategory: Joi.string()
        .hex()
        .length(24)
        .allow(null),

    icon: Joi.string().optional(),

    color: Joi.string()
        .pattern(/^#([0-9A-F]{3}){1,2}$/i)
        .optional(),

    isActive: Joi.boolean().optional()
});

export default createCategoryDTO;
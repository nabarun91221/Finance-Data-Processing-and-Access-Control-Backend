import Joi from "joi";

const updateCategoryDTO = Joi.object({

    name: Joi.string().trim().min(2).max(100),

    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9-]+$/),

    type: Joi.string()
        .valid("INCOME", "EXPENSE"),

    parentCategory: Joi.string()
        .hex()
        .length(24)
        .allow(null),

    icon: Joi.string(),

    color: Joi.string()
        .pattern(/^#([0-9A-F]{3}){1,2}$/i),

    isActive: Joi.boolean()

}).min(1);

export default updateCategoryDTO;
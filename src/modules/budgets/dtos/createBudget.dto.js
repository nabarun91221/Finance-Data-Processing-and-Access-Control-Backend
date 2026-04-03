import Joi from "joi";

const createBudgetDTO = Joi.object({
    financialYear: Joi.string()
        .pattern(/^\d{4}-\d{4}$/)
        .required()
        .messages({
            "string.pattern.base": "financialYear must be format YYYY-YYYY"
        }),

    startDate: Joi.date().required(),

    endDate: Joi.date().greater(Joi.ref("startDate")).required(),

    totalBudget: Joi.number().positive().required(),

    isActive: Joi.boolean().optional()
});
export default createBudgetDTO;
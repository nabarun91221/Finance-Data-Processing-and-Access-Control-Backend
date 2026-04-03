import Joi from "joi";
const updateBudgetDTO = Joi.object({
    financialYear: Joi.string()
        .pattern(/^\d{4}-\d{4}$/),

    startDate: Joi.date(),

    endDate: Joi.date(),

    totalBudget: Joi.number().positive(),

    isActive: Joi.boolean()
});

export default updateBudgetDTO;
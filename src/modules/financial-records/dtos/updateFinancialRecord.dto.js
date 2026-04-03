import Joi from "joi";

const updateFinancialRecordDTO = Joi.object({

    amount: Joi.number()
        .min(0),

    category: Joi.string()
        .hex()
        .length(24),

    date: Joi.date(),

    note: Joi.string()
        .trim()
        .max(500),

}).min(1);

export default updateFinancialRecordDTO;
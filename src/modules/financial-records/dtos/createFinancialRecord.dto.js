import Joi from "joi";

const createFinancialRecordDTO = Joi.object({

    amount: Joi.number()
        .min(0)
        .required(),

    category: Joi.string()
        .hex()
        .length(24)
        .required(),

    date: Joi.date()
        .required(),

    note: Joi.string()
        .trim()
        .max(500)
        .optional(),

});

export default createFinancialRecordDTO;
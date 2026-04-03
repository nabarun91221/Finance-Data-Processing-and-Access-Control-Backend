import joi from "joi"

const registerDto = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
})
export default registerDto;
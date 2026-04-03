import joi from "joi"
const loginDto = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
})
export default loginDto;
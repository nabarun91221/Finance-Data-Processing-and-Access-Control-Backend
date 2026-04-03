const validateDto = (dto) =>
{
    return async (req, res, next) =>
    {
        if (req.body == undefined) {
            return res.status(400).send({
                success: false,
                type: "DTO Validation Error",
                message: "Request body undefined"
            })
        }
        const { error, value } = dto.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            console.log("validation failed for", dto)
            return res.status(400).send({
                success: false,
                type: "DTO Validation Error",
                message: error.details.map(d => d.message)
            })
        }
        console.log("req.body: ", req.body);
        console.log("response:", value)
        req.body = value
        next()
    }
}
export default validateDto;
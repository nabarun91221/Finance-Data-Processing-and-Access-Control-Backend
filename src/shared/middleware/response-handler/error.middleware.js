const globalErrorHandler = (err, req, res, next) =>
{

    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value";
    }

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(val => val.message)
            .join(", ");
    }

    return res.status(statusCode).json({
        success: false,
        message
    });

};
export default globalErrorHandler;
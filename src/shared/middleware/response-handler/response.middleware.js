const globalResponseHandler = (req, res, next) =>
{

    const response = res.locals.responseData;

    if (!response) {
        return next();
    }

    const statusCode = response.statusCode || 200;

    const payload = {
        success: response.success ?? true
    };

    if (response.message !== undefined) {
        payload.message = response.message;
    }

    if (response.data !== undefined) {
        payload.data = response.data;
    }

    if (response.meta !== undefined) {
        payload.meta = response.meta;
    }

    if (!response.statusCode) {
        return res.json(payload);
    }
    return res.status(statusCode).json(payload);

};
export default globalResponseHandler;
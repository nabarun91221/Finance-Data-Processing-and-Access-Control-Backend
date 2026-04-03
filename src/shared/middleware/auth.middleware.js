import jwt from "jsonwebtoken"
import { configDotenv } from "dotenv";
configDotenv();
const verifyRequestJwt = (req, res, next) =>
{
    console.log("this is cookies:", req.cookies)
    const token = req.cookies.accessToken
    if (!token || token == null || token == undefined || token == {}) return res.status(403).send({ msg: "No access token found" })

    try {
        const decode = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decode
        next()
    } catch (err) {
        console.log(err)
        return res.status(403).send({ msg: "Token is invalid", err: err })
    }

}
export default verifyRequestJwt
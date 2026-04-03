import jwt from "jsonwebtoken"

class GenerateToken
{
    generateAccessToken = async (user) =>
    {
        const tokenPayload = {
            sub: user._id,
            role: user.role
        }
        const jwt_access_secret = process.env.JWT_ACCESS_SECRET;
        const accessToken = await jwt.sign(tokenPayload, jwt_access_secret, { expiresIn: '12h' })
        return accessToken;
    }
    generateRefreshToken = async (user) =>
    {
        const tokenPayload = {
            sub: user._id,
            role: user.role,
        }
        const jwt_refresh_secret = process.env.JWT_REFRESH_SECRET
        const refreshToken = await jwt.sign(tokenPayload, jwt_refresh_secret, { expiresIn: '7d' })
        return refreshToken;
    }
    generateResetPasswordToken = async (user) =>
    {
        const tokenPayload = {
            sub: user._id,
        }
        const jwt_password_reset_token = process.env.JWT_RESET_PASSWORD_SECRET
        const passwordResetToken = await jwt.sign(tokenPayload, jwt_password_reset_token, { expiresIn: '15m' });
        return passwordResetToken;
    }
    generateEmailConformationToken = async (user) =>
    {
        const tokenPayload = {
            sub: user._id,
        }
        const jwt_email_confirmation_token = process.env.JWT_EMAIL_CONFIRMATION_SECRET
        const emailConfirmationToken = await jwt.sign(tokenPayload, jwt_email_confirmation_token, { expiresIn: '15m' });
        return emailConfirmationToken;
    }
}
export default new GenerateToken()
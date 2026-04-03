import User from "../../users/models/user.model.js";
import GenerateTokenUtil from "../utils/generateToken.util.js"
import sendMail from "../../../shared/utils/mail.service.js"
import VerifyEmailToken from "../models/verifyEmailToken.model.js";
const PORT = process.env.PORT
class AuthController
{
    registerUser = async (req, res) =>
    {
        try {
            const userExist = await User.findOne({ email: req.body.email });
            if (userExist) {
                return res.send({
                    status: false,
                    message: `user with the mail id: ${userExist.email} already exist`
                })
            }
            const user = await User.create(req.body);
            if (user) {
                const { password, role, isActive, ...safeUser } = user._doc;
                const confirmEmailToken = await GenerateTokenUtil.generateEmailConformationToken(safeUser);
                const ExampleMailTemplate = `<div><h1>Go to the link to confirm your email</h1><span></span><h2>http://localhost:${PORT}/api/auth/verify/${confirmEmailToken}</h2></div>`
                const emailResInfo = await sendMail({ mailTemplate: ExampleMailTemplate, receiverEmail: user.email, subject: "PLEASE CONFIRM YOUR EMAIL" })
                if (emailResInfo) {
                    await VerifyEmailToken.create({ userId: user._id, token: confirmEmailToken })
                    return res.send({
                        success: true,
                        message: `The user with the mail ${user.email} has been created and an email has been send via mail to confirm the mail id.`,
                        data: {
                            link: `http://localhost:${PORT}/api/auth/verify/${confirmEmailToken}`
                        }
                    });
                }

            }
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                success: false,
                message: error.message,
            });
        }
    };
    logIn = async (req, res) =>
    {
        try {
            const user = await User.findOne({ email: req.body.email });

            if (!user) {
                return res.status(401).send({
                    success: false,
                    message: "no user found with this email",
                });
            }
            if (user.isActive == false) {
                return res.status(401).send({
                    success: false,
                    message: "user is not verified his/her email yet",
                });
            }

            const isSame = await user.comparePasswords(req.body.password);

            if (!isSame) {
                return res.status(401).send({
                    success: false,
                    message: "password verification failed",
                });
            }

            const accessToken = await GenerateTokenUtil.generateAccessToken(user);
            const refreshToken = await GenerateTokenUtil.generateRefreshToken(user);

            const { _id, name, email, role } = user;
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                path: "/",
                maxAge: 3 * 60 * 60 * 1000,
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.cookie("userRole", role, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.send({
                success: true,
                message: "successful login",
                user: {
                    id: _id.toString(),
                    name: name.toString(),
                    email: email.toString(),
                    role: role.toString(),
                },
            });


        } catch (error) {
            console.log(error);
            return res.status(500).send({
                success: false,
                message: error.message,
            });
        }
    };

    logout = async (req, res) =>
    {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.clearCookie("userRole");
        res.status(200).json({
            success: true,
            message: "successful logout",
        });
    };

    resetPassword = async (req, res) =>
    {
        const { email } = req.params;
        try {
            const isUserExist = await User.findOne({ email: email });
            if (!isUserExist) {
                return res.status(401).send({
                    success: false,
                    message: "No user found with this mailId",
                });
            }
            const passwordResetToken =
                await GenerateTokenUtil.generateResetPasswordToken(isUserExist);
            if (passwordResetToken) {
                return res.send({
                    success: true,
                    message: "password reset link has been send to your mail",
                });
            }
        } catch (error) {
            console.log(error);
            return res.send({
                success: false,
                message: "password reset failed",
            });
        }
    };
    verifyEmail = async (req, res) =>
    {
        try {

            const { token } = req.params;

            const tokenDoc = await VerifyEmailToken.findOne({ token });

            if (!tokenDoc) {
                return res.status(404).send({
                    success: false,
                    message: "Token not found"
                });
            }

            if (tokenDoc.isUsed) {
                return res.send({
                    success: true,
                    message: "User already verified"
                });
            }

            const user = await User.findByIdAndUpdate(
                tokenDoc.userId,
                { $set: { isActive: true } },
                { returnDocument: "after" }
            );

            if (!user) {
                return res.status(404).send({
                    success: false,
                    message: "User not found"
                });
            }

            await VerifyEmailToken.findByIdAndUpdate(
                tokenDoc._id,
                { $set: { isUsed: true } }
            );

            return res.status(200).send({
                success: true,
                message: "Email verified successfully",
                data: { email: user.email }
            });

        } catch (error) {

            console.error("Verify email error:", error);

            return res.status(500).send({
                success: false,
                message: "Email verification failed"
            });
        }
    };
}
export default new AuthController();

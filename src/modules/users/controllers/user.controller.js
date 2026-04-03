import User from "../models/user.model.js";
import { generatePassword } from "../../../shared/utils/autoGeneratePassword.js";
import sendMail from "../../../shared/utils/mail.service.js";
import invalidateCache from "../../../shared/middleware/cache-manager/cacheInvalidate.middleware.js";
class UsersController
{

    async createUser(req, res, next)
    {
        try {

            let { password } = req.body;
            if (!password) {
                password = generatePassword();
                req.body.password = password;
            }
            const user = await User.create({ ...req.body, isActive: true });
            const safeUser = user.toObject();
            delete safeUser.password;

            const ExampleMailTemplate = `
                    <div style="font-family: Arial; max-width:500px; margin:auto; padding:20px;">
                    <h2>Welcome to Finance Dashboard</h2>
                    <p>Your account has been created successfully.</p>
                    <p><strong>Email:</strong> ${safeUser.email}</p>
                    <p><strong>Password:</strong> ${password}</p>   
                </div>`;
            const emailResInfo = await sendMail({ mailTemplate: ExampleMailTemplate, receiverEmail: user.email, subject: "Account has been created" })

            if (!emailResInfo) {
                res.status(201).locals.responseData = {
                    status: true,
                    message: "User created successfully but email send failed",
                    data: safeUser
                };
                next();
                return;
            }
            invalidateCache("users:*")
            res.locals.auditLog = {
                action: "CREATE",
                entity: "USER",
                entityId: user._id,
            };
            res.status(201).locals.responseData = {
                status: true,
                message: `User created successfully and an email has been send to this email: ${safeUser.email}, with user login credential(with system generated or provided password)`,
                data: safeUser
            };

            next();

        } catch (err) {
            next(err);
        }
    }


    async getAllUsers(req, res, next)
    {
        try {

            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 10, 100);
            const skip = (page - 1) * limit;

            const filter = {};

            const [users, total] = await Promise.all([

                User.find(filter)
                    .select("-password")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),

                User.countDocuments(filter)

            ]);

            res.status(200).locals.responseData = {
                status: true,
                message: "Users fetched successfully",
                data: users,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };

            next();

        } catch (err) {
            next(err);
        }
    }


    async getUserById(req, res, next)
    {
        try {

            const user = await User
                .findById(req.params.id)
                .select("-password");

            if (!user) {
                return next({
                    statusCode: 404,
                    message: "User not found"
                });
            }

            res.status(200).locals.responseData = {
                status: true,
                message: "User fetched successfully",
                data: user
            };

            next();

        } catch (err) {
            next(err);
        }
    }


    async updateUser(req, res, next)
    {
        try {

            const user = await User.findById(req.params.id);

            if (!user) {
                return next({
                    statusCode: 404,
                    message: "User not found"
                });
            }

            Object.assign(user, req.body);

            await user.save();

            const safeUser = user.toObject();
            delete safeUser.password;

            invalidateCache("users:*")
            res.locals.auditLog = {
                action: "UPDATE",
                entity: "USER",
                entityId: user._id,
                changes: {
                    ...req.body
                }
            };
            res.status(200).locals.responseData = {
                status: true,
                message: "User updated successfully",
                data: safeUser
            };

            next();

        } catch (err) {
            next(err);
        }
    }


    async deleteUser(req, res, next)
    {
        try {

            const user = await User.findByIdAndDelete(req.params.id);

            if (!user) {
                return next({
                    statusCode: 404,
                    message: "User not found"
                });
            }

            invalidateCache("users:*")
            res.locals.auditLog = {
                action: "DELETE",
                entity: "USER",
                entityId: user._id,

            };

            res.status(200).locals.responseData = {
                status: true,
                message: "User deleted successfully"
            };

            next();

        } catch (err) {
            next(err);
        }
    }

}

export default new UsersController();
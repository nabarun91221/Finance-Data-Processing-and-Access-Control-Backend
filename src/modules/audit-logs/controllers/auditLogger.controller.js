import AuditLog from "../models/auditLogs.model.js";

class AuditController
{

    async getAuditLogs(req, res, next)
    {

        try {

            const { page = 1, limit = 20 } = req.query;

            const skip = (page - 1) * limit;

            const logs = await AuditLog
                .find()
                .populate("performedBy", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit));

            const total = await AuditLog.countDocuments();

            res.status(200).locals.responseData = {
                status: true,
                message: "Audit logs fetched",
                data: logs,
                meta: {
                    page: Number(page),
                    limit: Number(limit),
                    total
                }
            };

            next();

        } catch (err) {
            next(err);
        }

    }

}

export default new AuditController();
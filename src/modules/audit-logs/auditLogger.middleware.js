import AuditLog from "./models/auditLogs.model.js"

const auditLogger = async (req, res, next) =>
{
    console.log("audit logger hit..");

    try {

        if (!res.locals.auditLog) {
            return next();
        }

        const {
            action,
            entity,
            entityId,
            changes
        } = res.locals.auditLog;

        await AuditLog.create({
            action,
            entity,
            entityId,
            performedBy: req.user?.sub || null,
            changes
        });

        next();

    } catch (err) {
        next(err);
    }

};

export default auditLogger;
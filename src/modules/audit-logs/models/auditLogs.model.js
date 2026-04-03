import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({

    action: {
        type: String,
        enum: ["CREATE", "UPDATE", "DELETE"],
        required: true
    },

    entity: {
        type: String,
        required: true
    },

    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    changes: {
        type: Object
    }

}, { timestamps: true });

export default mongoose.model("AuditLog", auditLogSchema);
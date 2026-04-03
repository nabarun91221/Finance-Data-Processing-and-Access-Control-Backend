import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
    {
        financialYear: {
            type: String,
            required: true,
            example: "2025-2026"
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        totalBudget: {
            type: Number,
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    });

export default mongoose.model("Budget", budgetSchema);
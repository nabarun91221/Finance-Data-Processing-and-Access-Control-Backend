import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
            min: 0
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        date: {
            type: Date,
            required: true,
            index: true
        },

        note: {
            type: String,
            trim: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true
    });

export default mongoose.model("FinancialRecord", recordSchema);
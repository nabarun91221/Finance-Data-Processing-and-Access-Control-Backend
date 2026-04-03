import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true
        },

        type: {
            type: String,
            enum: ["INCOME", "EXPENSE",],
            required: true,
            index: true
        },

        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null
        },

        icon: {
            type: String
        },

        color: {
            type: String
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    });

export default mongoose.model("Category", categorySchema);
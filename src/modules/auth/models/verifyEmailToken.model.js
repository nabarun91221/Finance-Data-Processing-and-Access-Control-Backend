import mongoose from "mongoose";


const VerifyEmailTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    token: {
        type: String,
        require: true,
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expiresIn: 24 * 60 * 60
    }
})

export default mongoose.model("VerifyEmailToken", VerifyEmailTokenSchema);
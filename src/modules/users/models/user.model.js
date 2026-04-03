import { Schema, model } from "mongoose"
import bcrypt from "bcryptjs";
import { ROLES } from "../../../shared/utils/roles.js";
const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ROLES,
        default: "USER",
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
}
)

schema.pre("save", async function ()
{
    if (!this.isModified("password")) return;
    const hashedPassword = await bcrypt.hash(this.password, 10)
    this.password = hashedPassword;

})
schema.methods.comparePasswords = async function (inputPassword)
{
    const isSame = await bcrypt.compare(inputPassword, this.password)
    return isSame;
}

export default model("User", schema)

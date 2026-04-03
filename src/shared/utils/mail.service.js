import transporter from "../../configs/nodemailer.config.js";
import fs from "fs/promises"
import path from "path";
import { fileURLToPath } from "url";
const sendMail = async ({ mailTemplate, receiverEmail, subject }) =>
{
    try {
        const info = transporter.sendMail({
            from: `"N.M CAROLINA.CO.IN" ${process.env.DOMAIN_EMAIL}`,
            to: receiverEmail,
            subject: subject,
            html: mailTemplate,
        })
        if (info) return info;
    } catch (error) {
        console.log(`something went wrong while sending mail to:${receiverEmail}`, error);
    }
}
export default sendMail
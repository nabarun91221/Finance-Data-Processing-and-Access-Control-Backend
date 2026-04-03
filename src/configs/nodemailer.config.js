import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.DOMAIN_EMAIL,
        pass: process.env.DOMAIN_EMAIL_APP_PASS
    }
});
export default transporter;
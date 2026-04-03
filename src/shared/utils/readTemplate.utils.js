import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises"
const readTemplate = async (tempaleNameWithExtention, otp) =>
{
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    console.log(__dirname, `../../../shared/template/${tempaleNameWithExtention}`);

    const templatePath = path.join(__dirname, `../../../shared/template/${tempaleNameWithExtention}`);
    try {
        let mailTemplate = await fs.readFile(templatePath, "utf-8");
        mailTemplate = mailTemplate.replace("{{code}}", otp);
        return mailTemplate;
    } catch (error) {
        console.error(error);
        return null;
    }
}
export default readTemplate;
import crypto from "node:crypto";

export function generatePassword(length = 6)
{
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let password = "";

    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
        const randomIndex = randomBytes[i] % characters.length;
        password += characters[randomIndex];
    }

    return password;
}
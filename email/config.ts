
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { mailOptions } from "../utils/getCurrentDate";

export function configEmail() {
    return nodemailer.createTransport({
        service: 'mail.creatoke.net',
        host: 'mail.creatoke.net',  // Your mail server
        port: 465,                   // Port for SSL (use 587 for TLS)
        secure: true,
        auth: {
            user: process.env.FROM || '',
            pass: process.env.FROM_PASSWORD || ''
        }
    });
}

export async function handleExtraction(extractPath: string) {
    return new Promise((resolve, reject) => {
        fs.readdir(extractPath, (err, files) => {
            if (err) throw err;

            files.forEach((file, index) => {
                const oldPath = path.join(extractPath, file);
                const newPath = path.join(extractPath, `quittance_${index + 1}.pdf`);
                fs.renameSync(oldPath, newPath);
            });

            const attachments = files.map((_, index) => ({
                filename: `quittance_${index + 1}.pdf`,
                path: path.join(extractPath, `quittance_${index + 1}.pdf`)
            }));

            configEmail().sendMail(mailOptions(attachments), (error: any, info: any) => {
                if (error) {
                    reject(error);
                } else {
                    resolve('Email sent: ' + info.response);
                }
            });
        });
    });
}
// sendEmail.ts

import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";


const sendEmail = async (email:string | undefined, subject:string, payload:any, template:string): Promise<void> => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD
        }
    });

    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);
  
    const mailOptions = {
        from: "Bug Tracker TMU",
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
    };

    const info = await transporter.sendMail(mailOptions);

};

export default sendEmail;

// sendEmail.ts

import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";


const sendEmail = async (email:string | undefined, subject:string, payload:any, template:string): Promise<void> => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: 'alba77@ethereal.email',
            pass: 'jvfPM6DqsjDHbb5q73'
        }
    });

    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);
  
    console.log(compiledTemplate)
    const mailOptions = {
        from: "test123@example.com",
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

};

export default sendEmail;

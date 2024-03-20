import bcrypt from "bcryptjs"
import express, {Request,Response} from 'express'
import cors from 'cors'
import "dotenv/config"
import mongoose from 'mongoose';
import User from './models/user.model';
import jwt from "jsonwebtoken"
import Token from './models/token.model';
import crypto from "crypto"
import sendEmail from "./utils/email/sendEmail";
import cookieParser from "cookie-parser"
import verifyToken from "./middleware/auth";
import { createUserSchema, loginUserSchema } from "./schemas/user.schema";
import { ZodError } from 'zod';
import Report from "./models/report.model";






mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
const PORT = process.env.PORT || 5050;
const app = express()

app.use(express.json())
app.use(cookieParser());

app.use(express.urlencoded( {extended: true}))
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true
}))


app.get("/api/test", async (req: Request, res:Response) => {
    res.json({message: "Hello Wordld !"})

})
app.get("/api/users/:userId/tokens/:tokenId", async (req:Request, res:Response) => {
    const { userId, tokenId } = req.params;

    try {
        const user = await User.findById(userId)
        if (!user){
            return res.status(404).json({ message: "User not found" });
        }
        const token = await Token.findOne({userId: user.id,_id:tokenId})
        if (!token) {
            return res.status(404).json({ message: "Token not found" });
        }
        res.json(user.username)
    }catch(error) {
        res.status(500).send({message:"Something went wrong"})

    }
})
app.post("/api/login", async (req:Request, res:Response) => {
    const { body } = loginUserSchema.parse(req)
    const {username,password} = body


    try {
        let user=await User.findOne({username})
        if (!user) {
            return res.status(400).json({message:"Username does not exists !"})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message: "Invalid password"})
        }
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET_KEY as string, {expiresIn: "1d"})
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 86400000,
        })
        return  res.status(200).json({ userId: user._id });


    }catch (e){
        if (e instanceof ZodError) {
            // This is a validation error, so we respond with 400 and the error details
            return res.status(400).json({ errors: e.errors[0].message });
        }
        console.log(e)
        res.status(500).send({message:"Something went wrong"})
    }
})

app.post("/api/register", async(req:Request,res:Response) => {
    try {
        const { body } = createUserSchema.parse(req);
        const { username, password, email } = body;

        let user=await User.findOne({username})
        if (user) {
            return res.status(400).json({message:"Username already exists!"})
        }
        user= new User({ username, password, email })
        await user.save()

        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET_KEY as string, {expiresIn: "1d"})
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 86400000,
          });
        return res.status(200).send({ message: "User registered OK" })
    }
    catch(e){
        if (e instanceof ZodError) {
            // This is a validation error, so we respond with 400 and the error details
            return res.status(400).json({ errors: e.errors[0].message });
        }
        console.log(e)
        res.status(500).send({message:"Something went wrong"})
    }
})

app.post("/api/requestPasswordReset", async (req:Request,res:Response) => {
    try {
        console.log(req.body.email)
        let user= await User.findOne({email:req.body.email})
        if (!user) {
            return res.status(400).json({message:"User does not exists!"})
        }
        let token = await Token.findOne({userId: user.id})
        if (token) await token.deleteOne()
        let resetToken = crypto.randomBytes(32).toString("hex")
        const hash = await bcrypt.hash(resetToken, 8)
        token = await new Token({userId: user.id, token:hash,createdAt:Date.now()}).save()
        const link = `http://localhost:5173/reset-password?token=${resetToken}&id=${user.id}`
        sendEmail(user.email,"Password Reset Request",{name: user.username,link: link,},"./template/requestResetPassword.handlebars");
        return res.json(link);
    }catch (e) {
        console.log(e)
        res.status(500).send({message:"Something went wrong"})
    }
})

app.post('/api/resetPassword', async (req:Request,res:Response) => {
    try {
        let passwordResetToken = await Token.findOne({userId:req.body.userId})
        if(!passwordResetToken) {
            return res.status(400).json({message:"Invalid or expires password reset token!"})
        }
        const isValid = await bcrypt.compare(req.body.token, passwordResetToken.token as string);
        if (!isValid) {
            return res.status(400).json({message:"Invalid or expires password reset token!"})

        }

        const hash = await bcrypt.hash(req.body.password,8)
        await User.updateOne({
            _id: req.body.userId
        },
        { $set: {password: hash}},

        )
        const user = await User.findById({_id:req.body.userId})
        sendEmail(user?.email,"Password Reset Successfully", {name: user?.username},"./template/resetPassword.handlebars")
        await passwordResetToken.deleteOne()
        
        return res.json(true);
    }catch (e) {

    }
})

app.get('/api/validate-token',verifyToken, (req:Request,res:Response) => {
    res.status(200).send({userId:req.userId})
})

app.post('/api/logout', (req:Request,res:Response) => {
    res.cookie("auth_token", "",  {
        expires: new Date(0)
    })
    console.log("Testing from logout")
    res.send()
})

app.get('/api/reports', verifyToken, async (req:Request, res:Response) => {
    const userId = req.userId; // Assuming verifyToken middleware adds userId to req
    let user = await User.findById(userId);
    if (!user) {
        return res.status(400).json({message: "User unauthorized"});
    }

    const reports = await Report.find()
                                .select('number type summary isClosed -_id');
    console.log(reports)

    res.status(200).json(reports);
});

app.post("/api/report-bug", verifyToken, async (req, res) => {
    try {
        const { number, type, summary, progress } = req.body;
        const userId = req.userId; // Assuming verifyToken middleware adds userId to req
        let user=await User.findById(userId);
        if (!user) {
            return res.status(400).json({message:"User unauthorized"})
        }
        const bugReport = await Report.findOne({number})
        if (bugReport) {
            return res.status(400).json({message:"Bug report number already exists!"})

        }
        const newBugReport = new Report({
            number,
            type,
            summary,
            progress,
            createdBy: userId // Setting the creator of the bug report
        });

        await newBugReport.save();

        return res.status(200).send({ message: "Bug reported successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong" });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
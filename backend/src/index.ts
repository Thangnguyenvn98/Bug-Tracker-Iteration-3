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





mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
const PORT = process.env.PORT || 5050;
const app = express()

app.use(express.json())
app.use(express.urlencoded( {extended: true}))
app.use(cors())


app.get("/api/test", async (req: Request, res:Response) => {
    res.json({message: "Hello Wordld !"})

})

app.post("/api/login", async (req:Request, res:Response) => {
    try {
        let user=await User.findOne({username: req.body.username})
        if (!user) {
            return res.status(400).json({message:"Username does not exists !"})
        }
        return res.status(400)

    }catch (e){
        console.log(e)
        res.status(500).send({message:"Something went wrong"})
    }
})

app.post("/api/register", async(req:Request,res:Response) => {
    try {
        let user=await User.findOne({username: req.body.username})
        if (user) {
            return res.status(400).json({message:"Username already exists!"})
        }
        user= new User(req.body)
        await user.save()

        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET_KEY as string, {expiresIn: "1d"})
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 86400000
        })
        return res.sendStatus(200)
    }
    catch(e){
        console.log(e)
        res.status(500).send({message:"Something went wrong"})
    }
})

app.post("/api/requestPasswordReset", async (req:Request,res:Response) => {
    try {
        let user= await User.findOne({email:req.body.email})
        if (!user) {
            return res.status(400).json({message:"User does not exists!"})
        }
        let token = await Token.findOne({userId: user.id})
        if (token) await token.deleteOne()
        let resetToken = crypto.randomBytes(32).toString("hex")
        const hash = await bcrypt.hash(resetToken, 8)
        token = await new Token({userId: user.id, token:hash,createdAt:Date.now()})
        const link = `http://localhost:3000/passwordReset?token=${resetToken}&id=${user.id}`
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


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
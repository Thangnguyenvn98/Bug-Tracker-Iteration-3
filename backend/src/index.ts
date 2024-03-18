import express, {Request,Response} from 'express'
import cors from 'cors'
import "dotenv/config"
import mongoose from 'mongoose';
import User from './models/user.model';
import jwt from "jsonwebtoken"


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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
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
import path from "path"






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

app.use(express.static(path.join(__dirname, "../../frontend/dist")))
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
  });

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

app.post('/api/changePassword',verifyToken, async (req:Request,res:Response) => {
    const user = await User.findById(req.userId);
    if (!user) {
        return res.status(400).json({message:"User does not exists!"})
    }
    const {password,newPassword,newPasswordConfirmation} = req.body
    
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        return res.status(400).json({message: "Old password not match"})
    }
    if (newPassword !== newPasswordConfirmation) {
        return res.status(400).json({ message: "New password and confirmation do not match" });
    }
    user.password = newPassword
    await user.save()
    sendEmail(user.email,"Password Reset Successfully", {name: user.username},"./template/resetPassword.handlebars")

    res.json({ message: "Password changed successfully" });

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
        token = await new Token({userId: user.id, token:hash,createdAt:Date.now()}).save()
        const baseUrl = process.env.NODE_ENV === 'production'
                        ? 'https://bug-tracker-app-iteration-3.onrender.com'  // Replace with your actual production domain
                        : 'http://localhost:5173';

        const link = `${baseUrl}/password-reset?token=${resetToken}&id=${user.id}`;
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

app.get('/api/user',verifyToken, async (req:Request,res:Response) => {
    try {
        const user = await User.findById(req.userId).select('username email');
        if (!user) {
            return res.status(400).json({ message: "User not exists!" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching the user." });
    }
})

app.get('/api/user/:id',async (req:Request,res:Response) => {
    try {
        const {id} = req.params
        
        const user = await User.findById(id).select('username email');
        if (!user) {
            return res.status(400).json({ message: "User not exists!" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching the user." });
    }
})

app.post('/api/logout', (req:Request,res:Response) => {
    res.cookie("auth_token", "",  {
        expires: new Date(0)
    })
    res.send()
})

app.get('/api/reports', verifyToken, async (req:Request, res:Response) => {
    const userId = req.userId; // Assuming verifyToken middleware adds userId to req
    let user = await User.findById(userId);
    if (!user) {
        return res.status(400).json({message: "User unauthorized"});
    }

    const reports = await Report.find()
                                .select('number type summary isClosed -_id') 
                                .sort({ createdAt: -1 });;
    

    res.status(200).json(reports);
});

app.get('/api/user/:id/reports', async (req:Request, res:Response) => {
    const {id} = req.params
    let user = await User.findById(id);
    if (!user) {
        return res.status(400).json({message: "User unauthorized"});
    }

    // Find reports where the createdBy field matches the user's ID
    const reports = await Report.find({ createdBy: id })
                                .select('number type summary isClosed -_id') 
                                .sort({ createdAt: -1 });

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
        const progressUpdates = progress ? [userId] : []; // Add the userId to progressUpdates if progress is true

        const newBugReport = new Report({
            number,
            type,
            summary,
            createdBy: userId,
            progressUpdates, // Set the progressUpdates array here
            isClosed: false, // Initially, the bug is not closed
        });

        await newBugReport.save();

        return res.status(200).send({ message: "Bug reported successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong" });
    }
});

app.get('/api/bug/:id',verifyToken,async(req:Request,res:Response) => {
    const { id } = req.params;
    const bugReport = await Report.findOne({number:id})
    const userId = req.userId;
   
    if (!bugReport){
        return res.status(400).json({message:"Bug report number does not exists!"})
    }
  
    res.status(200).json(bugReport);
})

app.patch('/api/bug/:id',verifyToken,async(req:Request,res:Response) => {
    const { id } = req.params;
    const { type, summary, isClosed, reasonForClosing, isFixed, bugFixDetails } = req.body;
    const userId = req.userId;
    
    const bugReport = await Report.findOne({number:id})
    const previousType = bugReport?.type
    const previousSummary = bugReport?.summary
    if (!bugReport){
        return res.status(400).json({message:"Bug report number does not exists!"})
    } 
    bugReport.type = type || bugReport.type;
    bugReport.summary = summary || bugReport.summary;

    // Handle closing of the bug
    if (isClosed) {
        if (!reasonForClosing?.trim()) {
            return res.status(400).json({ message: "Need a reason to close the bug" });
        }
        bugReport.isClosed = true;
        bugReport.reasonForClosing = reasonForClosing;

        if (isFixed) {
            if (!bugFixDetails?.trim()) {
                return res.status(400).json({ message: "Need bug fix details to mark the bug as fixed" });
            }
            bugReport.isFixed = true;
            bugReport.bugFixDetails = bugFixDetails;
        } else {
            bugReport.isFixed = false;
            bugReport.bugFixDetails = '';
        }
    } else {
        bugReport.isClosed = false;
        bugReport.reasonForClosing = '';
        bugReport.isFixed = false;
        bugReport.bugFixDetails = '';
    }

    if (bugReport.createdBy.toString() !== userId && !bugReport.progressUpdates.includes(userId)) {
        bugReport.progressUpdates.push(userId);
    }
    await bugReport.save();
    

    let template:string;
    if (isClosed && isFixed) {
    template = 'closedAndFixedNotification.handlebars';
    } else if (isClosed && !isFixed) {
    template = 'closedButNotFixedNotification.handlebars';
    } else {
    template = 'updateNotification.handlebars';
    }
    const userIDsToUpdate = bugReport.progressUpdates.concat([bugReport.createdBy]);
    const usersToUpdate = await User.find({
        '_id': { $in: userIDsToUpdate }
            });
    usersToUpdate.forEach(user => {
                const emailData = {
                name: user.username,
                reportNumber: bugReport.number,
                status: bugReport.isClosed ? 'Closed' : 'Open',
                type: bugReport.type,
                summary: bugReport.summary,
                reasonForClosing: bugReport.reasonForClosing,
                bugFixDetails: bugReport.bugFixDetails,
                previousSummary,
                previousType
                    };
                    sendEmail(user.email, "Bug Report Update", emailData, `./template/${template}`);
                })
    res.json(true)
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
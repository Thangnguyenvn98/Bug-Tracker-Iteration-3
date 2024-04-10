import bcrypt from "bcryptjs";
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/user.model";
import jwt from "jsonwebtoken";
import Token from "./models/token.model";
import crypto from "crypto";
import sendEmail from "./utils/email/sendEmail";
import cookieParser from "cookie-parser";
import verifyToken from "./middleware/auth";
import { loginUserSchema } from "./schemas/user.schema";
import { ZodError } from "zod";
import Report from "./models/report.model";
import path from "path";
import { Server } from "socket.io";
import http from "http";
import Room from "./models/room.model";
import Message from "./models/message.model";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
const PORT = process.env.PORT || 5050;
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
console.log(process.env.FRONTEND_URL);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log(`A user connected ${socket.id}`);

  socket.on("join_room", async (data) => {
    const { username, userId, roomId } = data;
    // console.log("------------------------------------------------");
    // console.log(socket.rooms);
    // console.log("join_room");
    // console.log(roomId);

    if (!socket.rooms.has(roomId)) {
      socket.join(roomId);
      // console.log(`Socket ${socket.id} joined room ${roomId}`);
      // console.log(socket.rooms);
      // console.log("------------------------------------------------");

      const room = await Room.findById(roomId);
      if (room && !room.members.includes(userId)) {
        await Room.updateOne(
          { _id: roomId },
          { $addToSet: { members: userId } }
        );

        socket.to(roomId).emit("receive_message", {
          message: `${username} has joined the chat room`,
          username: "CHATBOT",
          createdAt: new Date().toISOString(),
        });

        if (room.owner?.toString() !== userId) {
          socket.emit("receive_message", {
            message: `Welcome ${username}`,
            username: "CHATBOT",
            createdAt: new Date().toISOString(),
          });
        }
      }
    } else {
      // console.log(`Socket ${socket.id} is already in room ${roomId}`);
      // console.log(socket.rooms);
      // console.log("------------------------------------------------");
    }
  });

  socket.on("send_message", async (messageData) => {
    const message = new Message({
      username: messageData.username,
      avatar: messageData.avatar, // Assuming avatar is optional and provided in messageData
      room: messageData.room, // Make sure this is a string representing the room ID
      message: messageData.message, // The actual message text
      imageUrl: messageData.imageUrl,
    });

    const savedMessage = await message.save();
    const roomId = savedMessage.room.toString();
    io.to(roomId).emit("receive_message", savedMessage);
  });

  socket.on("disconnecting", () => {});

  socket.on("leave_room", (data) => {
    socket.leave(data.room);
    // Handle any additional logic needed when a user leaves a room
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get("/api/test", async (req: Request, res: Response) => {
  res.json({ message: "Hello Wordld !" });
});

app.get("/api/messages/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const cursor = parseInt(req.query.cursor as string, 10) || 0; // Default to page 1 if not specified
  const limit = 10; // Number of items per page
  if (!roomId) {
    return res.status(400).json({ message: "Room ID is required!" });
  }
  try {
    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .skip(cursor)
      .limit(limit + 1);

    const hasNextPage = messages.length > limit;
    const nextCursor = hasNextPage ? cursor + limit : undefined;

    res.json({
      messages: messages.slice(0, limit),
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Error fetching messages");
  }
});

app.get(
  "/api/room/:roomId",
  verifyToken,
  async (req: Request, res: Response) => {
    const { roomId } = req.params;
    try {
      const room = await Room.findById(roomId)
        .populate("members", "username")
        .populate("owner", "username"); // Add this line

      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      res.status(200).json(room);
    } catch (error) {
      console.error("Failed to fetch room:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.put(
  "/api/room/:roomId",
  verifyToken,
  async (req: Request, res: Response) => {
    const { roomId } = req.params;

    const { name } = req.body;

    try {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        { name },
        { new: true }
      );

      res.status(200).json(updatedRoom);
    } catch (error) {
      console.error("Failed to fetch room:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.delete(
  "/api/room/:roomId",
  verifyToken,
  async (req: Request, res: Response) => {
    const { roomId } = req.params;

    try {
      const room = await Room.findById(roomId);

      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      await Message.deleteMany({ room: roomId });

      // Then delete the room itself
      await room.deleteOne();

      res.status(200).json({ message: "Room deleted" });
    } catch (error) {
      console.error("Failed to fetch room:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.post("/api/room", verifyToken, async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(400).json({ message: "User does not exists!" });
  }
  const existingRoom = await Room.findOne({
    name: req.body.name,
    owner: user.id,
  });
  if (existingRoom) {
    return res.status(400).json({ message: "Room name already exists!" });
  }
  const room = new Room({ name: req.body.name, owner: user.id });
  await room.save();
  return res.status(200).json(room);
});

app.get("/api/room", verifyToken, async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(400).json({ message: "User does not exists!" });
  }

  try {
    const rooms = await Room.find().populate("owner", "username");

    // Sort rooms to have user-owned rooms first
    const sortedRooms = rooms.sort((a, b) => {
      const isAOwner = a.owner?._id.toString() === user._id.toString() ? -1 : 1;
      const isBOwner = b.owner?._id.toString() === user._id.toString() ? -1 : 1;
      return isAOwner - isBOwner;
    });

    res.status(200).json(sortedRooms);
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get(
  "/api/users/:userId/tokens/:tokenId",
  async (req: Request, res: Response) => {
    const { userId, tokenId } = req.params;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const token = await Token.findOne({ userId: user.id, _id: tokenId });
      if (!token) {
        return res.status(404).json({ message: "Token not found" });
      }
      res.json(user.username);
    } catch (error) {
      res.status(500).send({ message: "Something went wrong" });
    }
  }
);
app.post("/api/login", async (req: Request, res: Response) => {
  const { body } = loginUserSchema.parse(req);
  const { username, password } = body;

  try {
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Username does not exists !" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });
    return res.status(200).json({ userId: user._id });
  } catch (e) {
    if (e instanceof ZodError) {
      // This is a validation error, so we respond with 400 and the error details
      return res.status(400).json({ errors: e.errors[0].message });
    }
    console.log(e);
    res.status(500).send({ message: "Something went wrong" });
  }
});


app.post("/api/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "Username already exists!" });
    }
    user = new User({ username, password, email });
    await user.save();

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });
    return res.status(200).send({ message: "User registered OK" });
  } catch (e) {
    if (e instanceof ZodError) {
      // This is a validation error, so we respond with 400 and the error details
      return res.status(400).json({ errors: e.errors[0].message });
    }
    console.log(e);
    res.status(500).send({ message: "Something went wrong" });
  }
});

app.post(
  "/api/changePassword",
  verifyToken,
  async (req: Request, res: Response) => {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "User does not exists!" });
    }
    const { password, newPassword, newPasswordConfirmation } = req.body;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password not match" });
    }
    if (newPassword !== newPasswordConfirmation) {
      return res
        .status(400)
        .json({ message: "New password and confirmation do not match" });
    }
    user.password = newPassword;
    await user.save();
    sendEmail(
      user.email,
      "Password Reset Successfully",
      { name: user.username },
      "./template/resetPassword.handlebars"
    );

    res.json({ message: "Password changed successfully" });
  }
);

app.post("/api/requestPasswordReset", async (req: Request, res: Response) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "User does not exists!" });
    }
    let token = await Token.findOne({ userId: user.id });
    if (token) await token.deleteOne();
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, 8);
    token = await new Token({
      userId: user.id,
      token: hash,
      createdAt: Date.now(),
    }).save();
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://bug-tracker-app-iteration-3.onrender.com" // Replace with your actual production domain
        : "http://localhost:5173";

    const link = `${baseUrl}/password-reset?token=${resetToken}&id=${user.id}`;
    sendEmail(
      user.email,
      "Password Reset Request",
      { name: user.username, link: link },
      "./template/requestResetPassword.handlebars"
    );
    return res.json(link);
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong" });
  }
});

app.post("/api/resetPassword", async (req: Request, res: Response) => {
  try {
    let passwordResetToken = await Token.findOne({ userId: req.body.userId });
    if (!passwordResetToken) {
      return res
        .status(400)
        .json({ message: "Invalid or expires password reset token!" });
    }
    const isValid = await bcrypt.compare(
      req.body.token,
      passwordResetToken.token as string
    );
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Invalid or expires password reset token!" });
    }

    const hash = await bcrypt.hash(req.body.password, 8);
    await User.updateOne(
      {
        _id: req.body.userId,
      },
      { $set: { password: hash } }
    );
    const user = await User.findById({ _id: req.body.userId });
    sendEmail(
      user?.email,
      "Password Reset Successfully",
      { name: user?.username },
      "./template/resetPassword.handlebars"
    );
    await passwordResetToken.deleteOne();

    return res.json(true);
  } catch (e) {}
});

app.get("/api/validate-token", verifyToken, (req: Request, res: Response) => {
  res.status(200).send({ userId: req.userId });
});

app.get("/api/user", verifyToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("username email");
    if (!user) {
      return res.status(400).json({ message: "User not exists!" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the user." });
  }
});

app.get("/api/user/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("username email");
    if (!user) {
      return res.status(400).json({ message: "User not exists!" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the user." });
  }
});

app.post("/api/logout", (req: Request, res: Response) => {
  res.cookie("auth_token", "", {
    expires: new Date(0),
  });
  res.send();
});

app.get("/api/reports", verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId; // Assuming verifyToken middleware adds userId to req
  let user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User unauthorized" });
  }

  const reports = await Report.find()
    .select("number type summary isClosed -_id")
    .sort({ createdAt: -1 });

  res.status(200).json(reports);
});

app.get("/api/user/:id/reports", async (req: Request, res: Response) => {
  const { id } = req.params;
  let user = await User.findById(id);
  if (!user) {
    return res.status(400).json({ message: "User unauthorized" });
  }

  // Find reports where the createdBy field matches the user's ID
  const reports = await Report.find({ createdBy: id })
    .select("number type summary isClosed -_id")
    .sort({ createdAt: -1 });

  res.status(200).json(reports);
});

app.post("/api/report-bug", verifyToken, async (req, res) => {
  try {
    const { number, type, summary, progress } = req.body;
    const userId = req.userId; // Assuming verifyToken middleware adds userId to req
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User unauthorized" });
    }
    const bugReport = await Report.findOne({ number });
    if (bugReport) {
      return res
        .status(400)
        .json({ message: "Bug report number already exists!" });
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

app.get("/api/bug/:id", verifyToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const bugReport = await Report.findOne({ number: id });
  const userId = req.userId;

  if (!bugReport) {
    return res
      .status(400)
      .json({ message: "Bug report number does not exists!" });
  }

  res.status(200).json(bugReport);
});

app.patch("/api/bug/:id", verifyToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, summary, isClosed, reasonForClosing, isFixed, bugFixDetails } =
    req.body;
  const userId = req.userId;

  const bugReport = await Report.findOne({ number: id });
  const previousType = bugReport?.type;
  const previousSummary = bugReport?.summary;
  if (!bugReport) {
    return res
      .status(400)
      .json({ message: "Bug report number does not exists!" });
  }
  bugReport.type = type || bugReport.type;
  bugReport.summary = summary || bugReport.summary;

  // Handle closing of the bug
  if (isClosed) {
    if (!reasonForClosing?.trim()) {
      return res
        .status(400)
        .json({ message: "Need a reason to close the bug" });
    }
    bugReport.isClosed = true;
    bugReport.reasonForClosing = reasonForClosing;

    if (isFixed) {
      if (!bugFixDetails?.trim()) {
        return res
          .status(400)
          .json({ message: "Need bug fix details to mark the bug as fixed" });
      }
      bugReport.isFixed = true;
      bugReport.bugFixDetails = bugFixDetails;
    } else {
      bugReport.isFixed = false;
      bugReport.bugFixDetails = "";
    }
  } else {
    bugReport.isClosed = false;
    bugReport.reasonForClosing = "";
    bugReport.isFixed = false;
    bugReport.bugFixDetails = "";
  }

  if (
    bugReport.createdBy.toString() !== userId &&
    !bugReport.progressUpdates.includes(userId)
  ) {
    bugReport.progressUpdates.push(userId);
  }
  await bugReport.save();

  let template: string;
  if (isClosed && isFixed) {
    template = "closedAndFixedNotification.handlebars";
  } else if (isClosed && !isFixed) {
    template = "closedButNotFixedNotification.handlebars";
  } else {
    template = "updateNotification.handlebars";
  }
  const userIDsToUpdate = bugReport.progressUpdates.concat([
    bugReport.createdBy,
  ]);
  const usersToUpdate = await User.find({
    _id: { $in: userIDsToUpdate },
  });
  usersToUpdate.forEach((user) => {
    const emailData = {
      name: user.username,
      reportNumber: bugReport.number,
      status: bugReport.isClosed ? "Closed" : "Open",
      type: bugReport.type,
      summary: bugReport.summary,
      reasonForClosing: bugReport.reasonForClosing,
      bugFixDetails: bugReport.bugFixDetails,
      previousSummary,
      previousType,
    };
    sendEmail(
      user.email,
      "Bug Report Update",
      emailData,
      `./template/${template}`
    );
  });
  res.json(true);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

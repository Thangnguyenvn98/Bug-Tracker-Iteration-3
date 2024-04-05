import mongoose from "mongoose";

export type MessageType = {
    _id: string;
    username: string;
    avatar:string;
    room:string;
    message: string;
    timestamps: Date;
    imageUrl?: string;  // Optional field for storing image URL

}

const messageSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: false
  },
  room:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required:true
  },
  message: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: false  // Make it optional since not all messages will have images
  }

},  {timestamps: {
createdAt: true,
updatedAt: false
} })

const Message = mongoose.model<MessageType>("Message",messageSchema)

export default Message
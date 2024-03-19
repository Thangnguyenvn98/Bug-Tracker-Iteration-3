import mongoose from "mongoose"


export type TokenType = {
    userId: String;
    token: String ;
    createdAt : {
        type: Date;
        expires: number;
    }
}

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    }
})

const Token = mongoose.model<TokenType>("Token",tokenSchema)

export default Token
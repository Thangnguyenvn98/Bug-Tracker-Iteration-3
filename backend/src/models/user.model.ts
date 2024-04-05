import mongoose from "mongoose"
import bcrypt from "bcryptjs"

export type UserType = {
    _id: string;
    email:string;
    username:string;
    password:string;
    ownedRooms: string[];
    joinedRooms: string[];
}

const userSchema = new mongoose.Schema({
    username: { type:String , required: true, unique:true},
    email: {type:String, required:true, unique: true},
    password: {type:String, required:true},
    ownedRooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }],
    role: {
        type: String,
        enum: ["user","organizer"],
        default: 'user'
      },
    joinedRooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }]
})

userSchema.pre("save", async function (next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password,8)
    }
    next()
})

userSchema.methods.comparePassword = async function (candidatePassword: string){
    

}

const User = mongoose.model<UserType>("User",userSchema);

export default User
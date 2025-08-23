import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true  // Adding index for faster search
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //cloudinary url
            required: true
        },
        coverImage: {
            type: String, //cloudinary url
        },
        waatchHistory: [
            {
                type:Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }
    },
    { timestamps: true }
);


// Hash the password before saving the user - Mongoose middleware
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next(); //only hash the password if it has been modified (or is new)
    this.password = await bcrypt.hash(this.password, 10);
    next()

    // if (this.isModified("password")) {
    //     this.password = await bcrypt.hash(this.password, 10);
    // }
    // next();
})


// Mongoose custom method to check if the entered password is correct
userSchemas.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password) // password is the plain text password, this.password is the hashed password
}


// Mongoose custom method to generate JWT tokens
userSchema.methods.generateAccessToken = function () {
    // jwt.sign(payload, secretOrPrivateKey, [options, callback])
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
)
}

// _id is a primary key for each document in MongoDB.
// It makes every document uniquely identifiable within a collection.
// Even if you don’t define it, MongoDB will create one for you.

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
)
}


export const User = mongoose.model("User", userSchema);

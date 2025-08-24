import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";



export const verifyJWT = asyncHandler(async (req, res, next) => {
    // access tokens from cookies (cookie-parser middleware)
    try {
        // req.cookies is set by cookie-parser middleware - from loginUser method in user.controller.js
        // console.log(req.cookies);
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        // console.log("token from verifyJWT middleware: ", token);
        
    
        if (!token) {
            throw new ApiError(401, "Unauthorized - No token provided");
        }
    
        // verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // console.log("decoded token: ", decodedToken);
        // console.log("decodedToken._id: ", decodedToken?._id);
        
        
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
            // console.log("user from verifyJWT middleware: ", user);
        
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        req.user = user; // attach user to request object
        next();
    } catch (error) {
        throw new ApiError(401, error?.messsage || "Unauthorized - Invalid token");
    }

})
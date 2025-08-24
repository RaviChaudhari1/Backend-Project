import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    // access tokens from cookies (cookie-parser middleware)
    try {
        const token = req.cookies?.accessToken || req.heaader("Authorization")?.replace("Bearer ", "");
    
        if (!token) {
            throw new ApiError(401, "Unauthorized - No token provided");
        }
    
        // verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._Id).select("-password -refreshToken");
        
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        req.user = user; // attach user to request object
        next();
    } catch (error) {
        throw new ApiError(401, error?.messsage || "Unauthorized - Invalid token");
    }

})
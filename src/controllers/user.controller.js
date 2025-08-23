import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const registerUser = asyncHandler( async (req,res) => {

    // get user data
    const { fullName, email, username, password} = req.body // json data and form data
    console.log(req.body);
    
    console.log(email);


    // validation - not empty
    if ([fullName, email, username, password].some( (field) => field?.trim() === "") ){
        throw new ApiError(400, "All fields is required")
    }


    // check if user already exists - username/email
    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser){
        throw new ApiError(409, "User already exists with this username/email")
    }

    
    // checkk for img then avatar
    // req.body - text data (express)
    //req.files - file data (multer middleware)
    const avatarLocalPath = req.files?.avatar[0]?.path // multer file object
    // console.log(req.files);
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }



    // upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // uploadOnCloudinary is called and it will return response

    if ( !avatar ){
        throw new ApiError(400, "Avatar is required")
    }


    // create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })


    // remove pass and reffresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    // check for user creation - return response else error
    if (!createdUser){
        throw new ApiError(500, "User creation failed")
    }


    // return response
    return res.status(201).json(
       new ApiResponse(200, createdUser, " User regestered successfully")
    )
    





    // if (fullName === ""){
    //     throw new ApiError(400, "Fullname is required")
    // }

    

})

export {registerUser};
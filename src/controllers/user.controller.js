import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// method for creating access and refresh token
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log("user found for token generation: ", user);
    
    const accessToken = user.generateAccessToken();
    console.log("Access Token generated: ", accessToken);
    
    const refreshToken = user.generateRefreshToken();
    console.log("Refresh Token generated: ", refreshToken);

    user.refreshToken = refreshToken;
    // passing validateBeforeSave: false to avoid re-validation of the user schema (password required)
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Token generation failed");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user data
  const { fullName, email, username, password } = req.body; // json data and form data
  console.log("Request Body sent by User: ", req.body);

  // console.log(email);

  // validation - not empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields is required");
  }

  // check if user already exists - username/email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists with this username/email");
  }

  // checkk for img then avatar
  // req.body - text data (express)
  //req.files - file data (multer middleware)
  const avatarLocalPath = req.files?.avatar[0]?.path; // multer file object
  console.log("User controller, files sent by User:", req.files);

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // uploadOnCloudinary is called and it will return response

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove pass and reffresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation - return response else error
  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, " User regestered successfully"));

  // if (fullName === ""){
  //     throw new ApiError(400, "Fullname is required")
  // }
});

const loginUser = asyncHandler(async (req, res) => {
  // data from req.body
  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  // username or email
  // find user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // password check if user exist (user.model.js)
  // User is a mongoose object that has access to default methods
  // user is an instance of User model so it has access to custom methods - isPasswordCorrect

  const isPasswordValid = await user.isPasswordCorrect(password); // true/false
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  // new user object with generated tokens or update previous user object
  const loggedInUser = await User.findById(user._id).select(
    " -password -refreshToken"
  );

  // send cookie
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accesstoken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
            // if user want to save data in local storage
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User login successful"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    // req.user is set in verifyJWT middleware
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }

    )
    // clear cookies
     const options = {
        httpOnly: true,
        secure: true,
     }

     return res.status(200).clearCookie("accessToken", options)
     .clearCookie("refreshToken", options)
     .json(new ApiResponse(200, {}, "User logged out successfully"))
});

export { registerUser, loginUser, logoutUser };

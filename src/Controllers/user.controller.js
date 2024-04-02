import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Models/user.models.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  const avatarPath = req.files?.avatar[0]?.path;
  // const coverImgPath=req.files?.coverImage[0]?.path

  let coverImgPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImgPath = req.files.coverImage[0].path;
  }

  if (!avatarPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarPath);
  const coverImage = await uploadOnCloudinary(coverImgPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "user does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,{ refreshToken: undefined });
  
    const options={
    httpOnly:true,
    secure:true
  }
  return res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged out"))
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
  
  const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
  
  if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request")
  }

  try {
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
    const user=await User.findById(decodedToken?._id)
    
    if (!user) {
      throw new ApiError(401,"Invalid refresh token")
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401,"Refresh token is expired or used")
    }
    const options={
      httpOnly:true,
      secure:true
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(200,{accessToken,refreshToken},"accessTOken refreshed")
    )
    
  } catch (error) {
    throw new ApiError(401,error?.message||"Invalid access token")
  }

})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body
  const user=User.findByIdAndDelete(req.user?._id)
  console.log(user);
  const isPasswordCorrect=user.isPasswordCorrect(oldPassword)
  console.log(isPasswordCorrect);
  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid old password")
  }
  user.password=newPassword
  await user.save({validateBeforeSave:false})
  return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
})

export { registerUser, loginUser, logoutUser,refreshAccessToken,changeCurrentPassword };

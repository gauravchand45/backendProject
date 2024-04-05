
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { ApiError } from "../Utils/ApiError.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!title && !description){
        throw new ApiError(400,"Title and description are required")
    }
    console.log(req.file);
    const videoPath=req.file?.path
    if(!videoPath){
        throw new ApiError(400,"Video is required")
    }
    const video=await uploadOnCloudinary(videoPath)
    if(!video){
        throw new ApiError(400,"Video is required")
    }
    return res.status(200).json(new ApiResponse(200,video,"Video uploaded successfully"))
})

export {publishAVideo}
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"})
        console.log("cloudinary response: ",response, response.url);
        
        // file has been uploaded on cloudinary
        console.log("file uploaded on cd");
        // for only url return response.url
        fs.unlinkSync(localFilePath) 
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove locally saved file if the upload fails
        return null;
    }
}


export {uploadOnCloudinary};
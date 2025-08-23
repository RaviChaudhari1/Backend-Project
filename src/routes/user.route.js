import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register").post( 
    // upload middleware for handling file uploads
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: ""
        }
    ]),
    registerUser )



export default router;
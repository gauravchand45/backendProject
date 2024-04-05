import { Router } from "express";
import { publishAVideo } from "../Controllers/video.controller.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router=Router()
router.route("/").post(verifyJWT,upload.single("video"),publishAVideo)

export default router
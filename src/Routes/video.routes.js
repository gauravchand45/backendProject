import { Router } from "express";
import { getAllVideos } from "../Controllers/video.controller.js";
const router=Router()
router.route("/").get(getAllVideos)

export default router
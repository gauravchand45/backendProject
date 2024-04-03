import { Router } from "express";
import { loginUser, logoutUser, registerUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage } from "../Controllers/user.controller.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router=Router()
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
    )
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/changePassword").post(verifyJWT,changeCurrentPassword)
router.route("/currentUser").post(verifyJWT,getCurrentUser)
router.route("/updateAccontDetails").patch(verifyJWT,updateAccountDetails)
router.route("/avatarChange").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/coverImageChange").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)


export default router
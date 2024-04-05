import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))
app.use(express.static("Public"))
app.use(cookieParser())

import userRouter from "./Routes/user.routes.js";
import videoRouter from "./Routes/video.routes.js"
import subscriptionRouter from "./Routes/subscription.routes.js"
import commentRouter from "./Routes/comment.routes.js"
import playlistRouter from "./Routes/playlist.routes.js"
import likeRouter from "./Routes/like.routes.js"
import tweetRouter from "./Routes/tweet.routes.js"

app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/playlists",playlistRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/tweets",tweetRouter)

export  {app}
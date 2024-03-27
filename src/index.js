import dotenv  from "dotenv";
import connectDB from "./DB/index.js";

dotenv.config({
    path:'./env'
})

connectDB()
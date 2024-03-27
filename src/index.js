import dotenv  from "dotenv";
import connectDB from "./DB/index.js";

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.on("error",()=>{
        console.log("Error",error);
        throw error
    })
})
.then(()=>{
    app.listen(process.env.PORT || 8000),()=>{
        console.log(`Server is running at http://localhost:${process.env.PORT}`);
    }
})
.catch((err)=>{
    console.log("MongoDB Connection Failed !!",err);
})
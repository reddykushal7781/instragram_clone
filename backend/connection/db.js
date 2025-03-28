import mongoose from "mongoose";
import config from "../utils/config.js"

const connectDB = async () => {
    try{
        await mongoose.connect(config.uri);
        console.log("mongodb connected successfully");
    }catch(error){
        console.log(error);
    }
}

export default connectDB;
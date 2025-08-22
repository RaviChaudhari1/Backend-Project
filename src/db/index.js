import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try{
        const connectingDB = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`\n✅ MongoDB Connected | DB Host: ${connectingDB.connection.host}`);
    }catch (error) {
        console.log(`❌MongoDB connection Failed !!`, error);
        process.exit(1)
    }
}

export default connectDB
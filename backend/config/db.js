import mongoose from "mongoose";

const connectDb = async () => {
    try {
        if(!process.env.MONGODB_URL){
            console.error("MONGODB_URL is not set in environment")
            throw new Error("missing MONGODB_URL")
        }
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database connected Successfully ✅✅")
    } catch (error) {
        console.error("db error:", error?.message || error)
    }
}
export default connectDb
import mongoose from "mongoose";

export async function dbConnect() {
    try {
        if (mongoose.connection.readyState == 1) {
        console.log("MongoDB already connected");
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");

    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}
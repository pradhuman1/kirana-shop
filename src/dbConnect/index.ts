import mongoose from "mongoose";
import "dotenv/config";

const { env } = process;
const { MONGODB_URL } = env;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined in environment variables.");
}

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("MongoDB connected");
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("MongoDB connection failed:", errMessage);
    process.exit(1);
  }
};

export default connectDB;

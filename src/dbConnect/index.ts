import mongoose from "mongoose";
import "dotenv/config";

const { env } = process;
const { MONGODB_URL } = env;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined in environment variables.");
}

let db: any;

const connectDB = async () => {
  try {
    if (!db) {
      await mongoose.connect(MONGODB_URL);
      db = mongoose.connection.db;

      console.log("MongoDB connected");
    }
    return db;
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("MongoDB connection failed:", errMessage);
    process.exit(1);
  }
};

export default connectDB;

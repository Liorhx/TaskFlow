import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  try {
    const uri = process.env.MONGODB_URI;

    console.log("Mongo URI:", uri);

    // Check env variable
    if (!uri) {
      console.error("❌ MONGODB_URI is missing in .env file");
      return false;
    }

    // Prevent multiple connections
    if (isConnected) {
      console.log("✅ MongoDB already connected");
      return true;
    }

    // Connect MongoDB
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = db.connections[0].readyState === 1;

    if (isConnected) {
      console.log("✅ MongoDB connected successfully");
      return true;
    }

    return false;
  } catch (error: any) {
    console.error("❌ MongoDB Connection Error");
    console.error(error.message);

    return false;
  }
}

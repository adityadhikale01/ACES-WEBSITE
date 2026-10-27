import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aces_kbtcoe';

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  if (isConnected) return true;

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`);
    return true;
  } catch (error: any) {
    console.warn(`[MongoDB] Notice: Could not connect to MongoDB at ${MONGODB_URI}`);
    console.warn(`[MongoDB] Details: ${error.message}`);
    console.warn(`[MongoDB] Provide a valid MONGODB_URI in server/.env (e.g., MongoDB Atlas connection string) to persist data across sessions.`);
    return false;
  }
};

export const getDBStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  host: mongoose.connection.host,
  name: mongoose.connection.name,
});

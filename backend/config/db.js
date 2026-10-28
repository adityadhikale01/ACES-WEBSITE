import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aces_kbtcoe';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[MongoDB] Connection error: ${err.message}`);
    if (process.env.NODE_ENV === 'test') {
      console.warn('[MongoDB] Running in test mode with memory mock or waiting connection.');
    }
    throw err;
  }
};

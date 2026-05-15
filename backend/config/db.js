import mongoose from 'mongoose';

/**
 * Connects to MongoDB using MONGODB_URI from environment.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('\n❌ MONGODB_URI is not set.\n');
    console.error('Fix: In the backend folder, create a file named .env (not only .env.example).');
    console.error('     PowerShell:  Copy-Item .env.example .env');
    console.error('     Then edit .env and set MONGODB_URI to your MongoDB connection string.\n');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

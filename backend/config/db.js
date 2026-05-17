import mongoose from 'mongoose';

/** Reuse connection across serverless invocations (Vercel). */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to MongoDB using MONGODB_URI from environment.
 */
export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const err = new Error('MONGODB_URI is not set');
    if (!process.env.VERCEL) {
      console.error('\n❌ MONGODB_URI is not set.\n');
      console.error('Fix: In the backend folder, create a file named .env (not only .env.example).');
      console.error('     PowerShell:  Copy-Item .env.example .env');
      console.error('     Then edit .env and set MONGODB_URI to your MongoDB connection string.\n');
      process.exit(1);
    }
    throw err;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    console.error('MongoDB connection error:', err.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw err;
  }
};

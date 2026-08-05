/**
 * Toyoland MongoDB Connection Module
 * 
 * Usage in your Express server:
 *   const { connectMongoDB, db } = require('./mongoConnection');
 *   await connectMongoDB();
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 
  `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}?authSource=${process.env.MONGODB_AUTH_SOURCE}`;

/**
 * Connect to MongoDB
 */
export async function connectMongoDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || 10),
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || 5),
      retryWrites: true,
      w: 'majority',
      socketTimeoutMS: 45000,
    });

    console.log('✓ MongoDB connected successfully');
    console.log(`✓ Database: ${mongoose.connection.db?.getName()}`);
    console.log(`✓ Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectMongoDB() {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    console.error('✗ MongoDB disconnection failed:', error.message);
  }
}

/**
 * Get MongoDB connection instance
 */
export function getDB() {
  return mongoose.connection.db;
}

/**
 * Health check for MongoDB
 */
export async function checkMongoDB() {
  try {
    const admin = mongoose.connection.db?.admin();
    const status = await admin?.ping();
    return { connected: true, status };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

export default mongoose.connection;

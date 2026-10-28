import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;

  if (primaryUri && !primaryUri.includes('localhost')) {
    try {
      const conn = await mongoose.connect(primaryUri);
      console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`[Database] Atlas connection error: ${err.message}. Trying local / fallback...`);
    }
  }

  // Try standard URI
  if (primaryUri) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 2500,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.log(`[Database] Standard MongoDB connection failed (${err.message}). Launching in-memory fallback for local demo...`);
    }
  }

  // Dynamic fallback: MongoMemoryServer for standalone zero-config offline runs
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      instance: { dbName: 'caresync' }
    });
    const memoryUri = memoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Embedded In-Memory MongoDB Started at ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[Database] Could not start embedded MongoDB: ${memErr.message}`);
    throw memErr;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

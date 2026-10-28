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
    // On Linux (e.g. Debian 12 on Render), MongoDB binaries require >= 7.0.3; on Windows, use local cache
    const binaryConfig = process.platform === 'linux' ? { version: '7.0.14' } : {};
    memoryServer = await MongoMemoryServer.create({
      binary: binaryConfig,
      instance: { dbName: 'caresync' },
    });
    const memoryUri = memoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Embedded In-Memory MongoDB Started at ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.warn(`[Database] Embedded MongoDB initialization note: ${memErr.message}`);
    return null;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

